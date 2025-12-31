import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderForm } from "@/components/trading/order-form"
import { OrdersTable } from "@/components/trading/orders-table"
import { PositionsWidget } from "@/components/trading/positions-widget"
import { MarketDataService } from "@/services/market-data"
{/* Market Ticker (Replaces Cards) */ }
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
                            <OrdersTable />
                            {/* <div className="text-muted-foreground text-sm">Brak aktywnych zleceń.</div> */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}
