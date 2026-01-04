import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FutureData {
    date: string;
    price: number;
}

interface FuturesKPIProps {
    year: string;
    data: FutureData[]; // Expected to be sorted by date
    label: string;
    color?: string; // 'teal' | 'orange' | undefined
}

export default function FuturesKPI({ year, data, label, color }: FuturesKPIProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center text-gray-400">
                Brak danych dla {label}
            </div>
        );
    }

    const latest = data[data.length - 1];
    const prev = data.length > 1 ? data[data.length - 2] : null;

    const price = latest.price;
    const prevPrice = prev ? prev.price : price;
    const change = prevPrice > 0 ? ((price - prevPrice) / prevPrice) * 100 : 0;

    // Calculate Min/Max/Avg for the visible period
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    const isPositive = change > 0;

    // Prepare chart data (ensure numeric values)
    const chartData = data.map(d => ({ val: d.price }));

    // Determine color hex based on prop or fallback to change direction
    let strokeColor = isPositive ? "#10B981" : "#EF4444";
    if (color === 'teal') strokeColor = '#134E4A';
    if (color === 'orange') strokeColor = '#F97316';

    const gradientId = `gradient-${year}`;

    return (
        <div className={`bg-white p-3 md:p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group transition-colors ${color === 'teal' ? 'hover:border-teal-700' : color === 'orange' ? 'hover:border-orange-500' : 'hover:border-gray-300'}`}>
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${color === 'teal' ? 'bg-teal-50 text-teal-700' : color === 'orange' ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                            {year}
                        </span>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</h3>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                            {price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">PLN/MWh</span>
                    </div>

                    <div className={`flex items-center mt-1 text-xs font-medium ${isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        <span>{isPositive ? '↑' : change < 0 ? '↓' : '–'} {Math.abs(change).toFixed(2)}%</span>
                        <span className="text-gray-400 font-normal ml-2 text-[10px]">vs wczoraj</span>
                    </div>
                </div>

                <div className="text-right">
                    {/* Desktop View: Full Stats */}
                    <div className="hidden md:block space-y-0.5">
                        <div className="text-[10px] text-gray-400">Min: <span className="text-gray-600 font-mono">{min.toFixed(2)}</span></div>
                        <div className="text-[10px] text-gray-400">Max: <span className="text-gray-600 font-mono">{max.toFixed(2)}</span></div>
                        <div className="text-[10px] text-gray-400">Śr: <span className="text-gray-600 font-mono">{avg.toFixed(2)}</span></div>
                    </div>

                    {/* Mobile View: Popover */}
                    <div className="md:hidden">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                    <Info className="w-4 h-4" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 bg-white p-3 shadow-xl border rounded-xl z-500" side="left" align="start">
                                <div className="space-y-2 text-sm">
                                    <h4 className="font-semibold text-gray-700 border-b pb-1 mb-1 text-xs uppercase tracking-wide">Statystyki</h4>
                                    <div className="flex justify-between text-gray-500 text-xs"><span>Min:</span> <span className="font-mono text-gray-900 font-bold">{min.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-500 text-xs"><span>Max:</span> <span className="font-mono text-gray-900 font-bold">{max.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-500 text-xs"><span>Śr:</span> <span className="font-mono text-gray-900 font-bold">{avg.toFixed(2)}</span></div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            {/* Sparkline Background */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="val"
                            stroke={strokeColor}
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
