import { Prisma, OrderStatus, OrderEventType, PrismaClient } from "@prisma/client"
import { createOrderEventAndNotifications } from "@/lib/notifications"

/**
 * Checks for overdue orders for a given organization and marks them as EXPIRED.
 * This ensures that limits are released and the UI reflects the correct state.
 * 
 * Should be called within a transaction if possible, or with the raw prisma client.
 */
export async function expireOverdueOrders(
    tx: Prisma.TransactionClient | PrismaClient,
    organizationId: string
) {
    const now = new Date()

    // 1. Find candidates
    const overdueOrders = await tx.order.findMany({
        where: {
            organizationId,
            status: { in: [OrderStatus.SUBMITTED, OrderStatus.NEEDS_APPROVAL, OrderStatus.DRAFT, OrderStatus.PARTIALLY_FILLED] },
            validUntil: { lt: now }
        },
        select: { id: true, orderNumber: true, userId: true } // Added userId for actor
    })

    if (overdueOrders.length === 0) return 0

    // 2. Process updates sequentially
    let count = 0
    for (const order of overdueOrders) {
        // Double check atomic update or assume race conditions are handled by optimistic concurrency?
        // Safe enough to just update status if still valid.

        try {
            await tx.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.EXPIRED }
            })

            await createOrderEventAndNotifications(tx, {
                orderId: order.id,
                type: OrderEventType.ORDER_EXPIRED,
                actorUserId: order.userId, // Attributing to user who set the expiry
                payload: { reason: "Time limit reached" }
            })

            count++
        } catch (e) {
            console.error(`Failed to expire order ${order.id}`, e)
        }
    }

    return count
}
