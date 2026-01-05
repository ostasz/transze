import { Prisma, OrderEventType, UserRole } from "@prisma/client"

type TransactionClient = Prisma.TransactionClient

export async function createOrderEventAndNotifications(
    tx: TransactionClient,
    params: {
        orderId: string
        type: OrderEventType
        actorUserId: string
        payload?: any
    }
) {
    const { orderId, type, actorUserId, payload } = params

    // 1. Create Event
    await tx.orderEvent.create({
        data: {
            orderId,
            type,
            actorUserId,
            payload: payload ?? Prisma.JsonNull
        }
    })

    // 2. Fetch Order Details (needed for notifications)
    const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
            product: true,
            organization: true,
            createdByUser: true
        }
    })

    if (!order) return // Should not happen in tx

    const orderTitle = `${order.product.symbol} | ${order.organization.name}`
    const orderLink = `/trading?orderId=${order.id}` // Default link for client
    const adminLink = `/admin/trade-desk?orderId=${order.id}` // Link for trader

    // 3. Determine Recipients and Content
    let recipientIds: string[] = []
    let title = ""
    let body = ""
    let href = ""

    const isClientAction = [
        "ORDER_CREATED",
        "ORDER_CANCEL_REQUESTED",
        "ORDER_CANCELLED_BY_CLIENT"
    ].includes(type)

    if (isClientAction) {
        // Client performed action -> Notify Internal Traders
        const traders = await tx.user.findMany({
            where: {
                role: { in: [UserRole.TRADER, UserRole.ADMIN, UserRole.BACKOFFICE] },
                isActive: true
            },
            select: { id: true }
        })
        recipientIds = traders.map(t => t.id)

        href = adminLink

        switch (type) {
            case "ORDER_CREATED":
                title = "Nowe zlecenie"
                body = `${order.organization.name} złożył zlecenie na ${order.product.symbol} (${order.quantityMW} MW)`
                break
            case "ORDER_CANCEL_REQUESTED":
                title = "Prośba o anulowanie"
                body = `${order.organization.name} prosi o anulowanie ${order.product.symbol}`
                break
            case "ORDER_CANCELLED_BY_CLIENT":
                title = "Anulowano zlecenie"
                body = `${order.organization.name} anulował zlecenie na ${order.product.symbol}`
                break
        }

    } else {
        // Trader performed action -> Notify Client (Creator)
        recipientIds = [order.userId]
        href = orderLink

        switch (type) {
            case "ORDER_FILLED":
                title = "Zlecenie zrealizowane"
                body = `Twoje zlecenie na ${order.product.symbol} zostało zrealizowane.`
                break
            case "ORDER_PARTIALLY_FILLED":
                title = "Zlecenie częściowo zrealizowane"
                body = `Twoje zlecenie na ${order.product.symbol} zostało częściowo zrealizowane.`
                break
            case "ORDER_CANCELLED_BY_TRADER":
                title = "Zlecenie anulowane"
                body = `Twoje zlecenie na ${order.product.symbol} zostało anulowane przez tradera.`
                break
            case "ORDER_REJECTED":
                title = "Zlecenie odrzucone"
                body = `Twoje zlecenie na ${order.product.symbol} zostało odrzucone. Powód: ${payload?.reason || 'Brak'}`
                break
        }
    }

    // 4. Create Notifications
    if (recipientIds.length > 0 && title) {
        // Dedupe key: ensure unique notification per event per user
        // We can use random UUID or composite
        await tx.notification.createMany({
            data: recipientIds.map(userId => ({
                recipientUserId: userId,
                organizationId: order.organizationId,
                title,
                body,
                href,
                dedupeKey: `${type}-${orderId}-${Date.now()}` // Simple dedupe
            })),
            skipDuplicates: true
        })
    }
}
