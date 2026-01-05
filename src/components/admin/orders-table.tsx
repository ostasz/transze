"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { ArrowUpDown, Loader2 } from "lucide-react"

export interface AdminOrder {
    id: string
    status: string
    quantityMW: number
    filledMW: number
    limitPrice: number
    side: "BUY" | "SELL"
    createdAt: string
    updatedAt: string
    organization: { name: string }
    product: { symbol: string }
    createdByUser: { email: string }
    validUntil?: string | null
}

interface AdminOrdersTableProps {
    initialOrders?: AdminOrder[]
}

const STATUS_MAP: Record<string, string> = {
    SUBMITTED: "OCZEKUJE",
    PARTIALLY_FILLED: "CZĘŚCIOWO",
    NEEDS_APPROVAL: "DO AKCEPTACJI",
    FILLED: "ZREALIZOWANE",
    CANCELLED: "ANULOWANE",
    REJECTED: "ODRZUCONE",
    DRAFT: "SZKIC",
    EXPIRED: "WYGASŁE"
}

export function AdminOrdersTable({ initialOrders = [] }: AdminOrdersTableProps) {
    const [orders, setOrders] = useState<AdminOrder[]>(initialOrders)
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
    const [action, setAction] = useState<"FILL" | "REJECT" | null>(null)
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)

    // Form states
    const [fillPrice, setFillPrice] = useState<string>("")
    const [fillVolume, setFillVolume] = useState<string>("")
    const [reason, setReason] = useState<string>("")
    const [processing, setProcessing] = useState(false)
    const [open, setOpen] = useState(false)

    // Sorting logic
    const sortedOrders = [...orders].sort((a, b) => {
        if (!sortConfig) return 0
        const { key, direction } = sortConfig

        let aValue: any = a
        let bValue: any = b

        // Handle nested keys
        if (key === "organization.name") {
            aValue = a.organization?.name
            bValue = b.organization?.name
        } else if (key === "product.symbol") {
            aValue = a.product?.symbol
            bValue = b.product?.symbol
        } else if (key === "createdByUser.email") {
            aValue = a.createdByUser?.email
            bValue = b.createdByUser?.email
        } else {
            aValue = a[key as keyof AdminOrder]
            bValue = b[key as keyof AdminOrder]
        }

        // Handle nulls/undefined
        if (aValue === bValue) return 0
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        // Compare
        if (aValue < bValue) return direction === "asc" ? -1 : 1
        if (aValue > bValue) return direction === "asc" ? 1 : -1
        return 0
    })

    const requestSort = (key: string) => {
        let direction: "asc" | "desc" = "asc"
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }
        setSortConfig({ key, direction })
    }

    const SortableHead = ({ label, sortKey }: { label: string, sortKey: string }) => (
        <TableHead>
            <Button
                variant="ghost"
                onClick={() => requestSort(sortKey)}
                className="h-8 -ml-4 px-3 data-[state=open]:bg-accent hover:bg-transparent"
            >
                {label}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </TableHead>
    )

    // Reload orders helper
    const refreshOrders = async () => {
        try {
            const res = await fetch("/api/admin/orders")
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            }
        } catch (e) {
            console.error("Failed to refresh orders")
        }
    }

    const openAction = (order: AdminOrder, act: "FILL" | "REJECT") => {
        setSelectedOrder(order)
        setAction(act)

        if (act === "FILL") {
            setFillPrice(order.limitPrice.toString())
            setFillVolume((order.quantityMW - order.filledMW).toString())
        } else {
            setReason("")
        }

        setOpen(true)
    }

    const handleSubmit = async () => {
        if (!selectedOrder || !action) return

        setProcessing(true)
        try {
            let res
            if (action === "FILL") {
                res = await fetch(`/api/admin/orders/${selectedOrder.id}/fill`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        price: parseFloat(fillPrice),
                        quantityMW: parseFloat(fillVolume)
                    })
                })
            } else {
                res = await fetch(`/api/admin/orders/${selectedOrder.id}/reject`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reason })
                })
            }

            if (!res.ok) {
                const err = await res.json()
                alert(`Error: ${err.message}`)
            } else {
                setOpen(false)
                refreshOrders()
            }
        } catch (e) {
            console.error(e)
            alert("Błąd połączenia")
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <SortableHead label="Data Zlecenia" sortKey="createdAt" />
                            <SortableHead label="Ważne do" sortKey="validUntil" />
                            <SortableHead label="Klient" sortKey="organization.name" />
                            <SortableHead label="Instrument" sortKey="product.symbol" />
                            <SortableHead label="Strona" sortKey="side" />
                            <SortableHead label="Wolumen" sortKey="quantityMW" />
                            <SortableHead label="Cena (Limit)" sortKey="limitPrice" />
                            <SortableHead label="Status" sortKey="status" />
                            <TableHead className="text-right">Akcje</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedOrders.map((order) => {
                            return (
                                <TableRow key={order.id}>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(order.createdAt), "dd.MM HH:mm")}
                                        <div className="font-semibold text-foreground">{order.createdByUser?.email.split('@')[0]}</div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {order.validUntil ? format(new Date(order.validUntil), "dd.MM HH:mm") : "-"}
                                    </TableCell>
                                    <TableCell className="font-medium">{order.organization?.name}</TableCell>
                                    <TableCell>{order.product?.symbol}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.side === "BUY" ? "default" : "destructive"}>
                                            {order.side === "BUY" ? "KUPNO" : "SPRZEDAŻ"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>{order.quantityMW} MW</div>
                                        {order.filledMW > 0 && (
                                            <div className="text-xs text-green-600">Zrealizowano: {order.filledMW}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>{order.limitPrice.toFixed(2)} PLN</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{STATUS_MAP[order.status] || order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openAction(order, "FILL")}
                                        >
                                            Realizuj
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => openAction(order, "REJECT")}
                                        >
                                            Odrzuć
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    Brak oczekujących zleceń. Czas na kawę ☕️
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {action === "FILL"
                                ? "Realizacja zlecenia"
                                : (selectedOrder?.filledMW && selectedOrder.filledMW > 0
                                    ? "Zamknięcie reszty zlecenia"
                                    : "Odrzucenie zlecenia")
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {selectedOrder?.product?.symbol} | {selectedOrder?.organization?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {action === "FILL" ? (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Cena (PLN)</Label>
                                <Input
                                    className="col-span-3"
                                    type="number"
                                    value={fillPrice}
                                    onChange={e => setFillPrice(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Wolumen (MW)</Label>
                                <Input
                                    className="col-span-3"
                                    type="number"
                                    value={fillVolume}
                                    onChange={e => setFillVolume(e.target.value)}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                                Pozostało do realizacji: {(selectedOrder ? selectedOrder.quantityMW - selectedOrder.filledMW : 0).toFixed(0)} MW
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Powód odrzucenia (opcjonalne)</Label>
                                <Input
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="np. Błąd limitów, Brak płynności"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Anuluj</Button>
                        <Button
                            variant={action === "FILL" ? "default" : "destructive"}
                            onClick={handleSubmit}
                            disabled={processing}
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {action === "FILL"
                                ? "Potwierdź realizację"
                                : (selectedOrder?.filledMW && selectedOrder.filledMW > 0
                                    ? "Zamknij resztę"
                                    : "Odrzuć zlecenie")
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
