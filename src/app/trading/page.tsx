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
            createdAt: o.createdAt,
            validUntil: o.validUntil
        }))
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Panel Handlowy</h1>

            {/* Market Ticker (Replaces Cards) */}
            <MarketTicker />

            {/* Main Content Grid */}
            <div className="flex flex-col gap-6">

                {/* Top Section: Execution & Risk (Side-by-Side on large screens) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Order Entry */}
                    <div className="lg:col-span-7 xl:col-span-8 min-w-0">
                        <OrderForm />
                    </div>

                    {/* Positions Widget */}
                    <div className="lg:col-span-5 xl:col-span-4 min-w-0">
                        <PositionsWidget />
                    </div>
                </div>

                {/* Bottom Section: Active Orders Table (Full Width) */}
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
    )
}
