import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const orderSchema = z.object({
    instrument: z.string(),
    side: z.enum(["BUY", "SELL"]),
    quantityType: z.enum(["MW", "PERCENT"]),
    quantity: z.number(),
    limitPrice: z.number(),
})

export const dynamic = 'force-dynamic';

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

        const { instrument, side, quantityType, quantity, limitPrice } = result.data

        // Logic:
        // 1. Find Product by symbol 'instrument' (mock or real)
        // 2. Check contract (skipped for MVP)
        // 3. Create Order

        // Find Product
        let product = await prisma.product.findUnique({ where: { symbol: instrument } })

        if (!product) {
            // Auto-create product for MVP if missing (dev mode only) or return error
            // return NextResponse.json({ message: "Produkt nie istnieje" }, { status: 404 })

            // Creating stub product for flow continuity
            product = await prisma.product.create({
                data: {
                    symbol: instrument,
                    profile: instrument.includes("PEAK") ? "PEAK" : "BASE",
                    period: "YEAR", // mocked
                    deliveryStart: new Date("2026-01-01"),
                    deliveryEnd: new Date("2026-12-31")
                }
            })
        }

        // Create Order
        const order = await prisma.order.create({
            data: {
                organizationId: session.user.organizationId,
                userId: session.user.id,
                productId: product.id,
                side: side,
                quantityMW: quantityType === "MW" ? quantity : 0, // Calculate if percent?
                quantityPercent: quantityType === "PERCENT" ? quantity : null,
                limitPrice: limitPrice,
                status: "SUBMITTED",
                validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24h
            }
        })

        // Log Audit
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "ORDER_CREATE",
                resource: `Order:${order.id}`,
                details: { ...result.data }
            }
        })

        return NextResponse.json({ message: "Zlecenie przyjęte", orderId: order.id }, { status: 201 })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Wystąpił błąd serwera" }, { status: 500 })
    }
}
