import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderForm } from "@/components/trading/order-form"
import { OrdersTable } from "@/components/trading/orders-table"
import { PositionsWidget } from "@/components/trading/positions-widget"
import { MarketTicker } from "@/components/trading/market-ticker"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function TradingPage() {
    const session = await auth()
    const organizationId = session?.user?.organizationId

    let orders: any[] = []

    if (organizationId) {
        const dbOrders = await prisma.order.findMany({
            where: { organizationId },
            include: { product: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        orders = dbOrders.map(o => ({
            id: o.id,
            instrument: o.product.symbol,
            side: o.side,
            quantity: o.quantityMW ?? o.quantityPercent ?? 0,
            price: o.limitPrice,
            status: o.status,
            createdAt: o.createdAt
        }))
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Panel Handlowy</h1>

            {/* Market Ticker (Replaces Cards) */}
            <MarketTicker />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Left Column: Order Entry (1/4) */}
                <div className="xl:col-span-1 border-r pr-6">
                    <OrderForm />
                </div>

                {/* Right Column: Positions & Active Orders (3/4) */}
                <div className="xl:col-span-3 space-y-6">
                    {/* Positions */}
                    <PositionsWidget />

                    {/* Active Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Twoje Zlecenia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrdersTable orders={orders} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
