"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, XCircle } from "lucide-react"
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
    filledMW: number // Added field
    price: number
    status: string
    createdAt: Date | string
    validUntil?: Date | string | null
}

interface OrdersTableProps {
    orders?: Order[]
}

export function OrdersTable({ orders = [] }: OrdersTableProps) {
    const router = useRouter()
    const [processingId, setProcessingId] = useState<string | null>(null)

    const handleCancel = async (orderId: string) => {
        if (!confirm("Czy na pewno chcesz anulować to zlecenie?")) return

        setProcessingId(orderId)
        try {
            const res = await fetch(`/api/trading/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" })
            })

            if (!res.ok) {
                const json = await res.json()
                throw new Error(json.message || "Błąd anulowania")
            }

            // Refresh to update status
            router.refresh()
            window.dispatchEvent(new Event("trading:update"))
        } catch (e: any) {
            alert(e.message)
        } finally {
            setProcessingId(null)
        }
    }

    const sortedOrders = [...orders].sort((a, b) => {
        const isACancelled = a.status === "CANCELLED"
        const isBCancelled = b.status === "CANCELLED"
        if (isACancelled && !isBCancelled) return 1
        if (!isACancelled && isBCancelled) return -1
        return 0
    })

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
                        <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedOrders.map((order) => {
                        const isCancelled = order.status === "CANCELLED"
                        const cellClass = isCancelled ? "line-through text-muted-foreground opacity-60" : ""

                        return (
                            <TableRow key={order.id} className={isCancelled ? "bg-muted/20" : ""}>
                                <TableCell className={`font-medium ${cellClass}`}>{order.instrument}</TableCell>
                                <TableCell className={isCancelled ? "opacity-60" : ""}>
                                    <Badge variant={order.side === "BUY" ? "default" : "destructive"} className={isCancelled ? "bg-gray-400 hover:bg-gray-400 border-transparent text-white" : ""}>
                                        {order.side === "BUY" ? "KUPNO" : "SPRZEDAŻ"}
                                    </Badge>
                                </TableCell>
                                <TableCell className={cellClass}>
                                    <div>{order.quantity} MW</div>
                                    {order.filledMW > 0 && (
                                        <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                            Wypełniono: {order.filledMW} MW
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className={cellClass}>{order.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        order.status === "FILLED" ? "bg-green-100 text-green-800 border-green-200" :
                                            order.status === "CANCELLED" ? "bg-gray-100 text-gray-500 border-gray-200" :
                                                ""
                                    }>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className={`text-xs text-muted-foreground ${isCancelled ? "line-through opacity-60" : ""}`}>
                                    {order.createdAt ? format(new Date(order.createdAt), "dd.MM HH:mm") : "-"}
                                </TableCell>
                                <TableCell className={`text-xs text-muted-foreground ${isCancelled ? "line-through opacity-60" : ""}`}>
                                    {order.validUntil ? format(new Date(order.validUntil), "dd.MM HH:mm") : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {["SUBMITTED", "NEEDS_APPROVAL", "DRAFT"].includes(order.status) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                                            onClick={() => handleCancel(order.id)}
                                            disabled={processingId === order.id}
                                            title="Anuluj zlecenie"
                                        >
                                            {processingId === order.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <XCircle className="h-4 w-4" />
                                            )}
                                            <span className="sr-only">Anuluj</span>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {sortedOrders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                Brak aktywnych zleceń. Złóż pierwsze zlecenie w formularzu obok.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
