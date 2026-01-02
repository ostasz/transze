"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

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

function YearSection({ data }: { data: YearData }) {
    const [isOpen, setIsOpen] = useState(false)
    const usagePercent = data.limit > 0 ? Math.round((data.maxUsage / data.limit) * 100) : 0

    return (
        <Card className="overflow-hidden border-none shadow-none md:border md:shadow-sm bg-transparent md:bg-card">
            {/* Header: Clickable on Mobile */}
            <CardHeader
                className="p-0 md:p-6 cursor-pointer md:cursor-default transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col gap-2 p-0 md:p-0">
                    <div className="flex justify-between items-start md:items-center">
                        <div className="w-full">
                            <div className="flex justify-between items-center w-full">
                                <CardTitle className="text-base md:text-lg">Pozycje {data.year}</CardTitle>
                                <div className="md:hidden text-muted-foreground">
                                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </div>
                            </div>

                            <div className="md:hidden mt-2">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Wykorzystanie limitu</span>
                                    <span className="font-medium text-foreground">{usagePercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all", usagePercent > 90 ? "bg-red-500" : "bg-primary")}
                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    />
                                </div>
                                <div className="text-xs text-right mt-1 font-mono text-muted-foreground">
                                    {data.maxUsage} / {data.limit} MW
                                </div>
                            </div>

                            <CardDescription className="hidden md:block mt-1">
                                Max wykorzystanie: <span className="font-medium text-foreground">{data.maxUsage} / {data.limit} MW ({usagePercent}%)</span>
                            </CardDescription>
                        </div>
                    </div>

                    {/* Desktop Legend */}
                    <div className="hidden md:flex gap-4 text-xs mt-2">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-primary rounded-sm"></div>
                            <span>Potwierdzone</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-amber-400 bg-[length:4px_4px] bg-stripes-white rounded-sm"></div>
                            <span>Oczekujące</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-secondary rounded-sm"></div>
                            <span>Dostępne</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Content: Collapsible on Mobile */}
            <CardContent className={cn("p-0 pt-4 md:p-6 md:pt-0 bg-transparent md:bg-transparent", isOpen ? "block" : "hidden md:block")}>
                {/* Mobile Legend */}
                <div className="flex md:hidden gap-3 text-xs mb-4 flex-wrap px-1">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-sm"></div>
                        <span>Potwierdzone</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-400 rounded-sm"></div>
                        <span>Oczekujące</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {data.months.map(m => {
                        const limit = data.limit
                        const confPct = limit > 0 ? (m.confirmed / limit) * 100 : 0
                        const pendPct = limit > 0 ? (m.pending / limit) * 100 : 0
                        const total = m.confirmed + m.pending
                        const isOverLimit = total > limit
                        const overflow = total - limit

                        return (
                            <div key={m.month} className="grid grid-cols-12 gap-2 items-center text-sm">
                                {/* Month Label */}
                                <div className="col-span-2 sm:col-span-2 font-mono text-muted-foreground text-xs uppercase">
                                    {m.monthLabel}
                                </div>

                                {/* Bar */}
                                <div className="col-span-7 sm:col-span-8">
                                    <div className="h-3 bg-secondary rounded-sm overflow-hidden flex relative w-full">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${Math.min(confPct, 100)}%` }}
                                        />
                                        <div
                                            className="h-full bg-amber-400 relative"
                                            style={{ width: `${Math.min(pendPct, 100 - (isOverLimit ? 0 : confPct))}%` }}
                                        >
                                            <div className="absolute inset-0 opacity-30" style={{
                                                backgroundImage: "linear-gradient(45deg,rgba(255,255,255,.5) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.5) 50%,rgba(255,255,255,.5) 75%,transparent 75%,transparent)",
                                                backgroundSize: "6px 6px"
                                            }}></div>
                                        </div>
                                        {isOverLimit && (
                                            <div className="h-full bg-destructive absolute right-0 top-0 bottom-0 w-1"></div>
                                        )}
                                    </div>
                                </div>

                                {/* Value */}
                                <div className="col-span-3 sm:col-span-2 text-right text-xs font-mono">
                                    {isOverLimit ? (
                                        <span className="text-destructive font-bold">{total.toFixed(1)}!</span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {total.toFixed(1)}
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
        return () => { window.removeEventListener("trading:update", handleUpdate) }
    }, [])

    if (loading) return (
        <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader><CardTitle>Ładowanie...</CardTitle></CardHeader>
        </Card>
    )

    if (years.length === 0) return (
        <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader><CardTitle>Pozycje</CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Brak danych.</p>
            </CardContent>
        </Card>
    )

    return (
        <div className="flex flex-col gap-4">
            {years.map((yearData) => (
                <YearSection key={yearData.year} data={yearData} />
            ))}
        </div>
    )
}
