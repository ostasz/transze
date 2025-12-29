"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function PositionsWidget() {
    // Mock data
    const positions = [
        { product: "BASE_Y_26", net: 15, limit: 20 },
        { product: "PEAK_Y_26", net: -5, limit: 10 },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Twoje Pozycje (Netto MW)</CardTitle>
                <CardDescription>Aktualne zaangażowanie vs Limity</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {positions.map(pos => (
                        <div key={pos.product} className="space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                                <span>{pos.product}</span>
                                <span className={pos.net < 0 ? "text-red-500" : "text-green-500"}>
                                    {pos.net > 0 ? "+" : ""}{pos.net} MW
                                </span>
                            </div>
                            {/* Simple visualization relative to limit (example) */}
                            <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                                {/* Logic for bar: this is simplified. A real bar needs center-zero logic for long/short */}
                                <div className={`h-full ${pos.net < 0 ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${Math.abs(pos.net) / pos.limit * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Limit: {pos.limit} MW</span>
                                <span>{Math.round(Math.abs(pos.net) / pos.limit * 100)}% Used</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
