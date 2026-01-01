"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface MonthData {
    month: number
    monthLabel: string
    confirmed: number
    pending: number
    total: number
}

interface YearData {
    year: string
    limit: number
    maxUsage: number
    months: MonthData[]
}

export function PositionsWidget() {
    const [years, setYears] = useState<YearData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPos = async () => {
            try {
                const res = await fetch("/api/trading/positions")
                if (res.ok) {
                    const data = await res.json()
                    // The API returns distinct YearData, sort by year just in case
                    setYears(data.sort((a: YearData, b: YearData) => a.year.localeCompare(b.year)))
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchPos()

        const handleUpdate = () => fetchPos()
        window.addEventListener("trading:update", handleUpdate)

        return () => {
            window.removeEventListener("trading:update", handleUpdate)
        }
    }, [])

    if (loading) return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Ładowanie...</CardTitle>
            </CardHeader>
        </Card>
    )

    if (years.length === 0) return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Twoje Pozycje</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">Brak danych o limitach lub pozycjach.</p>
            </CardContent>
        </Card>
    )

    return (
        <div className="flex flex-col gap-6">
            {years.map((yearData) => {
                const usagePercent = yearData.limit > 0 ? Math.round((yearData.maxUsage / yearData.limit) * 100) : 0
                return (
                    <Card key={yearData.year}>
                        <CardHeader className="pb-3">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg">Limit mocy – BASE ({yearData.year})</CardTitle>
                                    <CardDescription>
                                        Maksymalne wykorzystanie w roku: <span className="font-medium text-foreground">{yearData.maxUsage} / {yearData.limit} MW ({usagePercent}%)</span>
                                    </CardDescription>
                                </div>
                                {/* Legend */}
                                <div className="flex gap-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-primary rounded-sm"></div>
                                        <span>Confirmed</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-amber-400 bg-[length:4px_4px] bg-stripes-white rounded-sm"></div>
                                        <span>Pending</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-secondary rounded-sm"></div>
                                        <span>Available</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {yearData.months.map(m => {
                                    const limit = yearData.limit
                                    const confPct = limit > 0 ? (m.confirmed / limit) * 100 : 0
                                    const pendPct = limit > 0 ? (m.pending / limit) * 100 : 0

                                    // Handle overflow
                                    const total = m.confirmed + m.pending
                                    const isOverLimit = total > limit
                                    const overflow = total - limit

                                    return (
                                        <div key={m.month} className="grid grid-cols-12 gap-2 items-center text-sm">
                                            {/* Month Label */}
                                            <div className="col-span-2 sm:col-span-1 font-mono text-muted-foreground">
                                                {m.monthLabel}/{yearData.year.slice(2)}
                                            </div>

                                            {/* Bar */}
                                            <div className="col-span-7 sm:col-span-9">
                                                <div className="h-4 bg-secondary rounded-sm overflow-hidden flex relative w-full">
                                                    {/* Confirmed */}
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${Math.min(confPct, 100)}%` }}
                                                        title={`Confirmed: ${m.confirmed} MW`}
                                                    ></div>

                                                    {/* Pending */}
                                                    <div
                                                        className="h-full bg-amber-400 relative"
                                                        style={{ width: `${Math.min(pendPct, 100 - (isOverLimit ? 0 : confPct))}%` }}
                                                        title={`Pending: ${m.pending} MW`}
                                                    >
                                                        {/* Striped pattern overlay using CSS gradient */}
                                                        <div className="absolute inset-0 opacity-30" style={{
                                                            backgroundImage: "linear-gradient(45deg,rgba(255,255,255,.5) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.5) 50%,rgba(255,255,255,.5) 75%,transparent 75%,transparent)",
                                                            backgroundSize: "6px 6px"
                                                        }}></div>
                                                    </div>

                                                    {/* Error overlay if overlimit (just color the end red?) 
                                                        Actually user asked to turn red if confirmed + pending > 10 
                                                        Let's keep it simple: if isOverLimit, render a red bar at the end or turn pending red?
                                                    */}
                                                    {isOverLimit && (
                                                        <div className="h-full bg-destructive absolute right-0 top-0 bottom-0 w-1"></div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Value Labels */}
                                            <div className="col-span-3 sm:col-span-2 text-right text-xs">
                                                {isOverLimit ? (
                                                    <span className="text-destructive font-bold">+{overflow.toFixed(1)} MW!</span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        {total.toFixed(1)} / {limit}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
