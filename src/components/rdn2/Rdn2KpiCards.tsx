'use client';

import { ArrowUpRight, ArrowDownRight, Activity, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Rdn2KpiCardsProps {
    stats: {
        tgeBase: number;
        tgeBaseChange: number;
        tgePeak: number;
        tgePeakChange: number;
        minPrice: number;
        maxPrice: number;
        volume: number;
        volumeChange: number;
        history: any[];
        peakHistory: any[];
        spreadHistory: any[];
    };
    onDateSelect: (date: string) => void;
}

const Sparkline = ({ data, color, onDateSelect }: { data: any[], color: string, onDateSelect: (d: string) => void }) => (
    <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                    onDateSelect(e.activePayload[0].payload.date);
                }
            }}>
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="val"
                    stroke={color}
                    fillOpacity={1}
                    fill={`url(#gradient-${color})`}
                    strokeWidth={2}
                    activeDot={{ r: 4, fill: 'white', stroke: color, strokeWidth: 2 }}
                    className="cursor-pointer"
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const TrendBadge = ({ change }: { change: number }) => {
    const isPositive = change > 0;
    return (
        <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            isPositive ? "bg-[#D2E603]/20 text-[#65a30d]" : "bg-orange-100 text-orange-600"
        )}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change).toFixed(2)}%
        </div>
    );
};

export default function Rdn2KpiCards({ stats, onDateSelect }: Rdn2KpiCardsProps) {
    if (!stats) return null;

    const formatPrice = (val: number) => val.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatVolume = (val: number) => Math.round(val).toLocaleString('pl-PL');

    const cards = [
        {
            title: "TGE BASE (FIX I)",
            value: formatPrice(stats.tgeBase),
            change: stats.tgeBaseChange,
            icon: Activity,
            color: "#009D8F", // Mint
            data: stats.history,
            suffix: null
        },
        {
            title: "TGE PEAK (FIX I)",
            value: formatPrice(stats.tgePeak),
            change: stats.tgePeakChange,
            icon: Zap,
            color: "#F97316", // Orange
            data: stats.peakHistory,
            suffix: null
        },
        {
            title: "Spread (Max - Min)",
            value: formatPrice(stats.maxPrice - stats.minPrice),
            subValue: `${formatPrice(stats.minPrice)} - ${formatPrice(stats.maxPrice)}`,
            icon: TrendingUp,
            color: "#7C3AED", // Purple
            data: stats.spreadHistory,
            isSpread: true
        },
        {
            title: "Wolumen Obrotu",
            value: formatVolume(stats.volume),
            change: stats.volumeChange,
            icon: BarChart3,
            color: "#D2E603", // Lime
            data: [], // No history for volume in this design, or could add
            suffix: "MWh"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
                <div key={idx} className="relative group bg-white rounded-xl border border-gray-200 p-6 overflow-hidden hover:shadow-lg transition-all duration-300">
                    {card.data && card.data.length > 0 && (
                        <Sparkline data={card.data} color={card.color} onDateSelect={onDateSelect} />
                    )}

                    <div className="relative z-10 pointer-events-none">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white/80 transition-colors">
                                <card.icon className="h-6 w-6" style={{ color: card.color }} />
                            </div>
                            {card.change !== undefined && <TrendBadge change={card.change} />}
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.title}</p>
                            <h3 className={cn("font-bold text-gray-900 tracking-tight", card.value.length > 10 ? "text-2xl" : "text-3xl")}>
                                {card.value}
                                {card.suffix && <span className="text-lg text-gray-400 font-medium ml-1">{card.suffix}</span>}
                            </h3>
                            {card.isSpread && (
                                <p className="text-xs text-gray-400 mt-1 font-mono">{card.subValue}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
