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
            validUntil: o.validUntil,
            filledMW: o.filledMW ?? 0 // Map explicitly for the UI
        }))
    }

    return (
        <div className="flex flex-col gap-2 md:gap-6 pb-32 md:pb-6 max-w-7xl mx-auto w-full px-0 md:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-primary hidden md:block mt-6 px-4 md:px-0">Panel Handlowy</h1>

            {/* Market Ticker - Full Width Mobile */}
            <div className="w-full md:rounded-xl overflow-hidden md:border shadow-sm bg-background">
                <MarketTicker />
            </div>

            <div className="px-4 md:px-0 grid grid-cols-1 landscape:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-start">

                {/* 1. Positions (Mobile Top, Landscape Right, Desktop Right) */}
                <div className="order-1 landscape:order-2 lg:order-2 col-span-1 lg:col-span-1">
                    <PositionsWidget />
                </div>

                {/* 2. Order Form (Mobile Main, Landscape Left, Desktop Left) */}
                <div className="order-2 landscape:order-1 lg:order-1 col-span-1 lg:col-span-2">
                    <OrderForm />
                </div>

                {/* 3. Orders List (Mobile Bottom, Landscape Right Bottom, Desktop Bottom Left) */}
                <div className="order-3 landscape:order-3 lg:order-3 col-span-1 lg:col-span-2 landscape:col-span-1 landscape:col-start-2 lg:col-start-auto">
                    <div className="block">
                        <Card className="border-none shadow-none md:border md:shadow-sm bg-transparent md:bg-card">
                            <CardHeader className="px-0 pt-0 md:px-6 md:pt-6">
                                <CardTitle>Twoje Zlecenia</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 md:p-6">
                                <OrdersTable orders={orders} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
