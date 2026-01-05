"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"

export interface Order {
    id: string
    instrument: string
    side: "BUY" | "SELL"
    quantity: number
    filledMW: number
    price: number
    status: string
    createdAt: Date | string
    validUntil?: Date | string | null
    orderNumber?: string
    userName?: string
}

interface OrdersTableProps {
    orders?: Order[]
}

const STATUS_FILTERS = [
    { label: "Wszystkie", value: "ALL" },
    { label: "Oczekujące", value: "PENDING" },
    { label: "Zrealizowane", value: "FILLED" },
    { label: "Anulowane", value: "CANCELLED" },
]

export function OrdersTable({ orders = [] }: OrdersTableProps) {
    const router = useRouter()
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [filter, setFilter] = useState("ALL")

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

    const filteredOrders = orders.filter(o => {
        if (filter === "ALL") return true
        if (filter === "PENDING") return ["SUBMITTED", "NEEDS_APPROVAL", "DRAFT"].includes(o.status)
        if (filter === "FILLED") return ["FILLED", "PARTIALLY_FILLED"].includes(o.status)
        if (filter === "CANCELLED") return o.status === "CANCELLED"
        return true
    })

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const isACancelled = a.status === "CANCELLED"
        const isBCancelled = b.status === "CANCELLED"
        if (isACancelled && !isBCancelled) return 1
        if (!isACancelled && isBCancelled) return -1
        return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    })

    const renderStatusBadge = (status: string) => {
        return (
            <Badge variant="outline" className={cn(
                status === "FILLED" ? "bg-green-100 text-green-800 border-green-200" :
                    status === "PARTIALLY_FILLED" ? "bg-blue-100 text-blue-800 border-blue-200" :
                        status === "CANCELLED" ? "bg-gray-100 text-gray-500 border-gray-200" :
                            status === "REJECTED" ? "bg-red-100 text-red-800 border-red-200" :
                                status === "EXPIRED" ? "bg-amber-100 text-amber-800 border-amber-200" :
                                    "bg-yellow-100 text-yellow-800 border-yellow-200"
            )}>
                {status === "PARTIALLY_FILLED" ? "ZREALIZOWANE CZĘŚCIOWO" :
                    status === "FILLED" ? "ZREALIZOWANE" :
                        status === "CANCELLED" ? "ANULOWANE" :
                            status === "REJECTED" ? "ODRZUCONE" :
                                status === "EXPIRED" ? "WYGASŁE" :
                                    status === "SUBMITTED" ? "WYSŁANE" :
                                        status === "NEEDS_APPROVAL" ? "DO AKCEPTACJI" :
                                            status === "DRAFT" ? "SZKIC" :
                                                status}
            </Badge>
        )
    }

    return (
        <div className="space-y-4">
            {/* Filter Chips */}
            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar px-1">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                            filter === f.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Instrument</TableHead>
                            <TableHead>Strona</TableHead>
                            <TableHead>Wolumen</TableHead>
                            <TableHead>Cena</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Zlecający</TableHead>
                            <TableHead>Data</TableHead>
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
                                    <TableCell className={cellClass}>{order.price.toFixed(2)} PLN</TableCell>
                                    <TableCell>
                                        {renderStatusBadge(order.status)}
                                    </TableCell>
                                    <TableCell className={`text-sm ${cellClass}`}>{order.userName || "-"}</TableCell>
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
                                                {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
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
                                    Brak zleceń pasujących do filtra.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3 pb-24">
                {sortedOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-dashed">
                        Brak zleceń
                    </div>
                ) : (
                    sortedOrders.map((order) => {
                        const isCancelled = order.status === "CANCELLED"
                        return (
                            <Card key={order.id} className={cn("p-4 relative overflow-hidden", isCancelled && "opacity-70 bg-muted/20")}>
                                {processingId === order.id && (
                                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-col">
                                        {/* <span className="text-[10px] font-mono text-muted-foreground mb-0.5">
                                            {order.orderNumber}
                                        </span> */}
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-lg font-bold", isCancelled && "line-through text-muted-foreground")}>
                                                {order.instrument}
                                            </span>
                                            {isCancelled && <span className="text-xs text-muted-foreground">(Anulowane)</span>}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {order.createdAt ? format(new Date(order.createdAt), "dd.MM.yyyy HH:mm") : "-"}
                                        </span>
                                    </div>
                                    <Badge variant={order.side === "BUY" ? "default" : "destructive"} className={isCancelled ? "bg-gray-400 border-transparent text-white" : ""}>
                                        {order.side === "BUY" ? "KUPNO" : "SPRZEDAŻ"}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-3">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Wolumen</span>
                                        <div className="font-semibold">{order.quantity} MW</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground block">Cena</span>
                                        <div className="font-semibold">{order.price.toFixed(2)} PLN</div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Wypełniono</span>
                                        <div className="font-mono">{order.filledMW} MW</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground block">Status</span>
                                        {renderStatusBadge(order.status)}
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-dashed">
                                        <span className="text-xs text-muted-foreground block">Ważne do</span>
                                        <div className="font-mono text-xs">{order.validUntil ? format(new Date(order.validUntil), "dd.MM.yyyy HH:mm") : "-"}</div>
                                    </div>
                                </div>

                                {order.userName && (
                                    <div className="text-xs text-muted-foreground pt-2 border-t border-dashed mb-3">
                                        Zlecił: <span className="font-medium text-foreground">{order.userName}</span>
                                    </div>
                                )}

                                {["SUBMITTED", "NEEDS_APPROVAL", "DRAFT"].includes(order.status) && !isCancelled && (
                                    <div className="pt-3 border-t mt-1">
                                        <Button
                                            variant="outline"
                                            className="w-full h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            onClick={() => handleCancel(order.id)}
                                            disabled={processingId === order.id}
                                        >
                                            Anuluj zlecenie
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        )
                    })
                )}
            </div>
        </div >
    )
}
