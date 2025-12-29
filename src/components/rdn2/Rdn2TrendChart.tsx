'use client';

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Rdn2TrendChartProps {
    data: any[];
}

export default function Rdn2TrendChart({ data }: Rdn2TrendChartProps) {
    const [range, setRange] = useState<number>(30); // days

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const cutoffDate = subDays(new Date(), range);
        const cutoffStr = format(cutoffDate, 'yyyy-MM-dd');

        return data
            .filter(d => d.date >= cutoffStr)
            .map(d => ({
                date: d.date,
                timestamp: parseISO(d.date).getTime(),
                price: d.prices.reduce((a: number, b: number) => a + b, 0) / d.prices.length // Daily Average
            }));
    }, [data, range]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-xl shadow-lg text-sm">
                    <p className="font-bold text-gray-900 mb-1">
                        {format(parseISO(payload[0].payload.date), 'd MMMM yyyy (EEEE)', { locale: pl })}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#009D8F]" />
                        <span className="text-gray-500">Średnia dnia:</span>
                        <span className="font-mono font-medium">{payload[0].value.toFixed(2)} PLN</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Trend cenowy</h2>
                    <p className="text-xs text-gray-500">Średnia dobowa cena energii (TGe24)</p>
                </div>

                <div className="flex p-1 bg-gray-100 rounded-lg">
                    {[30, 90, 365].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                range === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {r === 365 ? '1 Rok' : `${r} Dni`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#009D8F" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#009D8F" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="timestamp"
                            scale="time"
                            type="number"
                            domain={['auto', 'auto']}
                            tickFormatter={(unixTime: number) => format(new Date(unixTime), range > 90 ? 'MMM' : 'd MMM', { locale: pl })}
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#009D8F"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
