
import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming standard utils

interface FutureData {
    date: string;
    price: number;
}

interface FuturesKPICompactProps {
    year: string;
    data: FutureData[];
    label: string;
    color?: 'teal' | 'orange';
}

export default function FuturesKPICompact({ year, data, label, color }: FuturesKPICompactProps) {
    if (!data || data.length === 0) return null;

    const latest = data[data.length - 1];
    const prev = data.length > 1 ? data[data.length - 2] : null;
    const price = latest.price;
    const prevPrice = prev ? prev.price : price;
    const change = prevPrice > 0 ? ((price - prevPrice) / prevPrice) * 100 : 0;
    const isPositive = change > 0;

    // Styles based on color
    const activeColor = color === 'teal' ? 'text-teal-700' : 'text-orange-700';
    const bgColor = color === 'teal' ? 'bg-teal-50' : 'bg-orange-50';
    const trendColor = isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';

    return (
        <div className="flex flex-col p-3 bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-1">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", bgColor, activeColor)}>
                    {year}
                </span>
                <span className={cn("text-xs font-bold flex items-center gap-1", trendColor)}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : change < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {Math.abs(change).toFixed(2)}%
                </span>
            </div>

            <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold tracking-tight">{price.toFixed(2)} <span className="text-[10px] text-gray-400 font-normal">PLN</span></span>
            </div>
        </div>
    );
}
