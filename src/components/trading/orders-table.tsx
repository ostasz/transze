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
import { format } from "date-fns"

export interface Order {
    id: string
    instrument: string
    side: "BUY" | "SELL"
    quantity: number
    price: number
    status: string
    createdAt: Date | string
    validUntil?: Date | string | null
}

interface OrdersTableProps {
    orders?: Order[]
}

export function OrdersTable({ orders = [] }: OrdersTableProps) {
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
                        <TableHead>Data utworzenia</TableHead>
                        <TableHead>Ważne do</TableHead>
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
                            <TableCell className="text-xs text-muted-foreground">
                                {order.createdAt ? format(new Date(order.createdAt), "dd.MM HH:mm") : "-"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {order.validUntil ? format(new Date(order.validUntil), "dd.MM HH:mm") : "-"}
                            </TableCell>
                        </TableRow>
                    ))}
                    {orders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                Brak aktywnych zleceń. Złóż pierwsze zlecenie w formularzu obok.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
