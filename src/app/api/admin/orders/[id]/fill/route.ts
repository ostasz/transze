import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

import { generateAdvisoryLockIds } from "@/lib/risk-engine"
import { createOrderEventAndNotifications } from "@/lib/notifications"
import { OrderEventType } from "@prisma/client"

const fillSchema = z.object({
    price: z.number().positive(),
    quantityMW: z.number().positive()
})

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id || !["ADMIN", "TRADER", "BACKOFFICE"].includes(session.user.role || "")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const validation = fillSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ message: "Invalid input" }, { status: 400 })
        }

        const { price, quantityMW } = validation.data

        return await prisma.$transaction(async (tx) => {
            // 1. Fetch Order and Lock
            const order = await tx.order.findUnique({
                where: { id },
                include: { product: true }
            })

            if (!order) {
                throw new Error("Order not found")
            }

            if (!["SUBMITTED", "PARTIALLY_FILLED"].includes(order.status)) {
                throw new Error("Order status does not allow filling")
            }

            // Lock (Org + Profile)
            const profile = order.product.symbol.includes("PEAK") ? "PEAK" : "BASE"
            const [lockKey1, lockKey2] = generateAdvisoryLockIds(order.organizationId, profile)
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey1}::int, ${lockKey2}::int)`

            // 2. Validate Fill Quantity
            const remainingToFill = order.quantityMW - order.filledMW
            // Allow small epsilon for float comparison logic if needed, but strict for now
            if (quantityMW > remainingToFill + 0.0001) {
                throw new Error(`Fill quantity (${quantityMW}) exceeds remaining order quantity (${remainingToFill})`)
            }

            // 3. Create Fill Record
            const fill = await tx.fill.create({
                data: {
                    orderId: id,
                    executedMW: quantityMW,
                    price: price,
                    executedByUserId: session.user.id
                }
            })

            // 4. Update Order
            const newFilledMW = order.filledMW + quantityMW
            const isFullyFilled = Math.abs(newFilledMW - order.quantityMW) < 0.0001

            // Calculate new average price
            // Current total value = (oldFilled * oldAvg) + (newFill * newPrice)
            // New Avg = Total Value / New Filled
            const oldTotalValue = order.filledMW * (order.averageFillPrice || 0)
            const newFillValue = quantityMW * price
            const newAveragePrice = (oldTotalValue + newFillValue) / newFilledMW

            await tx.order.update({
                where: { id },
                data: {
                    status: isFullyFilled ? "FILLED" : "PARTIALLY_FILLED",
                    filledMW: newFilledMW,
                    averageFillPrice: newAveragePrice
                }
            })

            // 5. Audit Log
            await tx.auditLog.create({
                data: {
                    userId: session.user.id!,
                    action: "ORDER_FILL",
                    resource: `Order:${id}`,
                    details: {
                        fillId: fill.id,
                        volume: quantityMW,
                        price: price,
                        status: isFullyFilled ? "FILLED" : "PARTIALLY_FILLED"
                    }
                }
            })

            // 6. Notifications
            await createOrderEventAndNotifications(tx, {
                orderId: id,
                type: isFullyFilled ? OrderEventType.ORDER_FILLED : OrderEventType.ORDER_PARTIALLY_FILLED,
                actorUserId: session.user.id!,
                payload: {
                    fillId: fill.id,
                    volume: quantityMW,
                    price: price,
                    status: isFullyFilled ? "FILLED" : "PARTIALLY_FILLED"
                }
            })

            return NextResponse.json({ message: "Fill executed", fillId: fill.id })
        })

    } catch (e: any) {
        console.error("Fill error:", e)
        return NextResponse.json({ message: e.message || "Server error" }, { status: 500 })
    }
}
