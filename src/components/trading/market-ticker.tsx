

"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const MARKET_DATA = [
    { symbol: "TGe24", price: 419.29, change: 1.2, unit: "PLN/MWh" },
    { symbol: "BASE_Y_26", price: 452.00, change: -0.5, unit: "PLN/MWh" },
    { symbol: "PEAK_Y_26", price: 580.50, change: 0.8, unit: "PLN/MWh" },
    { symbol: "GAS_Y_26", price: 185.20, change: -1.5, unit: "EUR/MWh" },
    { symbol: "CO2_DEC_25", price: 68.40, change: 0.2, unit: "EUR/t" },
    { symbol: "BASE_Q3_25", price: 390.10, change: 0.0, unit: "PLN/MWh" },
]

export function MarketTicker() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    const handleSelect = (symbol: string) => {
        window.dispatchEvent(new CustomEvent("trading:instrument-select", { detail: symbol }))
    }

    return (
        <div className="w-full bg-background border-b overflow-hidden relative">
            {/* Gradient Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex overflow-x-auto snap-x snap-mandatory py-2 px-4 gap-2 no-scrollbar scroll-smooth items-center">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-7 w-28 rounded-full flex-shrink-0" />
                    ))
                ) : (
                    MARKET_DATA.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(item.symbol)}
                            className="flex-shrink-0 snap-center group flex items-center gap-2 pl-3 pr-2 py-1 bg-muted/40 border rounded-full hover:bg-muted active:scale-95 transition-all w-auto h-8"
                        >
                            <span className="font-bold text-xs tracking-tight text-foreground group-hover:text-primary transition-colors">{item.symbol}</span>
                            <span className="font-mono text-xs text-muted-foreground">{item.price.toFixed(2)}</span>

                            <div className={cn(
                                "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1",
                                item.change > 0 ? "bg-green-500/10 text-green-600" :
                                    item.change < 0 ? "bg-red-500/10 text-red-600" :
                                        "bg-gray-100 text-gray-500"
                            )}>
                                {item.change > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : item.change < 0 ? <ArrowDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                                <span className="ml-0.5">{Math.abs(item.change)}%</span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
