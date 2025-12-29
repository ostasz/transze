"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function OrdersTable() {
    // Mock data for MVP visual if API isn't ready or for simplicity
    // Ideally fetch from /api/trading/orders
    const orders = [
        { id: "1", instrument: "BASE_Y_26", side: "BUY", quantity: 5, price: 450.00, status: "FILLED" },
        { id: "2", instrument: "PEAK_Q3_25", side: "SELL", quantity: 2, price: 580.50, status: "SUBMITTED" },
    ]

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Instrument</TableHead>
                        <TableHead>Strona</TableHead>
                        <TableHead>Wolumen (MW)</TableHead>
                        <TableHead>Cena (PLN)</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.instrument}</TableCell>
                            <TableCell>
                                <Badge variant={order.side === "BUY" ? "default" : "destructive"}>
                                    {order.side}
                                </Badge>
                            </TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>{order.price.toFixed(2)}</TableCell>
                            <TableCell>{order.status}</TableCell>
                        </TableRow>
                    ))}
                    {orders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">Brak aktywnych zleceń.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
