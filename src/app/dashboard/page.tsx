import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OrdersTable, Order } from "@/components/trading/orders-table"
import { PositionsWidget } from "@/components/trading/positions-widget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

import { expireOverdueOrders } from "@/lib/orders"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.organizationId) {
        // Technically middleware should catch this, but safe fallback
        redirect("/login")
    }

    // Trigger auto-expiration on dashboard load
    try {
        await expireOverdueOrders(prisma, session.user.organizationId)
    } catch (e) {
        console.error("Dashboard auto-expire error:", e)
    }

    const dbOrders = await prisma.order.findMany({
        where: {
            organizationId: session.user.organizationId
        },
        include: {
            product: {
                select: { symbol: true }
            },
            createdByUser: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    })

    const orders: Order[] = dbOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber || o.id.slice(0, 8),
        instrument: o.product.symbol,
        side: o.side,
        quantity: o.quantityMW ?? o.quantityPercent ?? 0,
        price: o.limitPrice,
        status: o.status,
        filledMW: o.filledMW ?? 0,
        createdAt: o.createdAt,
        validUntil: o.validUntil,
        userName: o.createdByUser.name || o.createdByUser.email || "Nieznany"
    }))

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Klienta</h1>
                <p className="text-muted-foreground">Podsumowanie Twojej aktywności i otwartych pozycji.</p>
            </div>

            <div className="flex flex-col gap-6">
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Ostatnie Zlecenia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrdersTable orders={orders} />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <PositionsWidget />
                </div>
            </div>
        </div>
    )
}
