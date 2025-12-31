import { OrdersTable } from "@/components/trading/orders-table"
import { PositionsWidget } from "@/components/trading/positions-widget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Klienta</h1>
                <p className="text-muted-foreground">Podsumowanie Twojej aktywności i otwartych pozycji.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Ostatnie Zlecenia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrdersTable />
                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-3">
                    <PositionsWidget />
                </div>
            </div>
        </div>
    )
}
