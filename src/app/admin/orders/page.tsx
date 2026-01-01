"use client"

import { useEffect, useState } from "react"
import { AdminOrdersTable, AdminOrder } from "@/components/admin/orders-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<AdminOrder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/admin/orders")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrders(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="p-8">Ładowanie zleceń...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Trade Desk</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Oczekujące Zlecenia Klientów</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminOrdersTable initialOrders={orders} />
                </CardContent>
            </Card>
        </div>
    )
}
