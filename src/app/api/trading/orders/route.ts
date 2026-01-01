import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { calculateExposureLedger, validateOrderRisk, generateAdvisoryLockIds } from "@/lib/risk-engine"

const orderSchema = z.object({
    instrument: z.string(),
    side: z.enum(["BUY", "SELL"]),
    quantityType: z.enum(["MW", "PERCENT"]),
    quantity: z.number(),
    limitPrice: z.number(),
    validUntil: z.string().datetime().optional().nullable(),
})

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.organizationId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const orders = await prisma.order.findMany({
            where: {
                organizationId: session.user.organizationId
            },
            include: {
                product: {
                    select: { symbol: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })

        const mappedOrders = orders.map(o => ({
            id: o.id,
            instrument: o.product.symbol,
            side: o.side,
            quantity: o.quantityMW ?? o.quantityPercent ?? 0,
            price: o.limitPrice,
            status: o.status,
            filledMW: o.filledMW ?? 0,
            createdAt: o.createdAt
        }))

        return NextResponse.json(mappedOrders)
    } catch (error) {
        console.error("GET orders error:", error)
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.organizationId) {
            return NextResponse.json({ message: "Brak organizacji" }, { status: 403 })
        }

        // Validate body
        const body = await req.json()
        const result = orderSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ message: "Błąd walidacji" }, { status: 400 })
        }

        const { instrument, side, quantityType, quantity, limitPrice, validUntil } = result.data

        // Determine profile from instrument (simple heuristic)
        const profile = instrument.includes("PEAK") ? "PEAK" : "BASE"

        return await prisma.$transaction(async (tx) => {
            // 1. ACQUIRE LOCK (Advisory Transaction Lock)
            // Scope: Organization + Profile
            // This ensures no other transaction can process orders for this profile concurrently.
            const [lockKey1, lockKey2] = generateAdvisoryLockIds(session.user.organizationId!, profile)

            // Execute raw SQL to acquire lock. It releases automatically at end of transaction.
            // Explicitly cast to int to match pg_advisory_xact_lock(int, int) signature
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey1}::int, ${lockKey2}::int)`

            // 2. Find/Verify Product
            let product = await tx.product.findUnique({ where: { symbol: instrument } })

            if (!product) {
                // Auto-creation for MVP flow (safe inside lock)
                product = await tx.product.create({
                    data: {
                        symbol: instrument,
                        profile: profile,
                        period: "YEAR", // Mock
                        deliveryStart: new Date("2026-01-01"), // Mock
                        deliveryEnd: new Date("2026-12-31")    // Mock
                    }
                })
            }

            const contracts = await tx.contract.findMany({
                where: {
                    organizationId: session.user.organizationId!,
                    isActive: true,
                    validTo: { gte: new Date() }
                }
            })

            if (!contracts.length) {
                throw new Error("Brak aktywnej umowy")
            }

            const isAllowedProduct = contracts.some(c => c.allowedProducts.includes(instrument))
            if (!isAllowedProduct) {
                throw new Error(`Produkt ${instrument} nie jest dozwolony w Twoich umowach`)
            }

            const aggregatedLimits: Record<string, number> = {}
            contracts.forEach(c => {
                const limits = (c as any).yearlyLimits as Record<string, number> | null
                if (limits) {
                    Object.entries(limits).forEach(([year, limit]) => {
                        aggregatedLimits[year] = (aggregatedLimits[year] || 0) + Number(limit)
                    })
                }
            })

            // 4. Fetch Active Orders for Risk Calculation
            const allActiveOrders = await tx.order.findMany({
                where: {
                    organizationId: session.user.organizationId!, // Non-null assertion safe due to checks above
                    status: { in: ["SUBMITTED", "FILLED", "PARTIALLY_FILLED", "APPROVED", "IN_EXECUTION", "NEEDS_APPROVAL"] }
                },
                include: {
                    product: { select: { symbol: true } }
                }
            })

            // 5. Build Ledger & Validate
            const ordersForRisk = allActiveOrders.map(o => ({
                productId: o.product.symbol,
                quantityMW: o.quantityMW || 0,
                filledMW: o.filledMW || 0,
                side: o.side,
                status: o.status
            }))

            const currentLedger = calculateExposureLedger(ordersForRisk)
            const validation = validateOrderRisk(
                currentLedger,
                { productId: instrument, quantityMW: quantity, side: side },
                aggregatedLimits
            )

            if (!validation.ok) {
                throw new Error(validation.error || "Błąd limitów handlowych")
            }

            // 6. Create Order
            const newOrder = await tx.order.create({
                data: {
                    organizationId: session.user.organizationId!,
                    userId: session.user.id!,
                    productId: product.id,
                    side: side,
                    quantityMW: quantityType === "MW" ? quantity : 0,
                    quantityPercent: quantityType === "PERCENT" ? quantity : null,
                    limitPrice: limitPrice,
                    status: "SUBMITTED",
                    validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 24 * 60 * 60 * 1000),
                }
            })

            // 7. Log Audit
            await tx.auditLog.create({
                data: {
                    userId: session.user.id!,
                    action: "ORDER_CREATE",
                    resource: `Order:${newOrder.id}`,
                    details: { ...result.data, locking: "pg_advisory_xact_lock" }
                }
            })

            return NextResponse.json({ message: "Zlecenie przyjęte", orderId: newOrder.id }, { status: 201 })
        })

    } catch (error: any) {
        console.error("Order processing error:", error)
        // Differentiate expected business errors vs server errors
        const msg = error.message || "Wystąpił błąd serwera"
        const status = (msg.includes("limit") || msg.includes("pokrycia") || msg.includes("umowy")) ? 403 : 500
        return NextResponse.json({ message: msg }, { status })
    }
}
