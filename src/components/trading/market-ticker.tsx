"use client"

import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown } from "lucide-react"

const MARKET_DATA = [
    { symbol: "TGe24", price: 419.29, change: 1.2, unit: "PLN/MWh" },
    { symbol: "BASE_Y_26", price: 452.00, change: -0.5, unit: "PLN/MWh" },
    { symbol: "PEAK_Y_26", price: 580.50, change: 0.8, unit: "PLN/MWh" },
    { symbol: "GAS_Y_26", price: 185.20, change: -1.5, unit: "EUR/MWh" },
    { symbol: "CO2_DEC_25", price: 68.40, change: 0.2, unit: "EUR/t" },
    { symbol: "BASE_Q3_25", price: 390.10, change: 0.0, unit: "PLN/MWh" },
]

export function MarketTicker() {
    return (
        <Card className="px-4 py-3 bg-card border-none shadow-sm overflow-hidden whitespace-nowrap relative">
            <div className="flex animate-scroll gap-8">
                {/* Duplicate the list to ensure seamless infinite scrolling */}
                {[...MARKET_DATA, ...MARKET_DATA, ...MARKET_DATA].map((item, i) => (
                    <div key={i} className="inline-flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{item.symbol}</span>
                        <div className="flex items-center gap-1">
                            <span className="font-mono text-sm">{item.price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">{item.unit}</span>
                        </div>
                        <span className={`text-xs flex items-center ${item.change > 0 ? "text-green-500" : item.change < 0 ? "text-red-500" : "text-gray-500"}`}>
                            {item.change > 0 && <ArrowUp className="w-3 h-3" />}
                            {item.change < 0 && <ArrowDown className="w-3 h-3" />}
                            {Math.abs(item.change)}%
                        </span>
                    </div>
                ))}
            </div>
            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 30s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </Card>
    )
}
