
import React from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface FuturesCandleChartProps {
    data: any[];
    contract: string;
}

export default function FuturesCandleChart({ data, contract }: FuturesCandleChartProps) {
    if (!data || data.length === 0) return null;

    // Pre-process data
    const chartData = data.map((d, i) => {
        const open = i > 0 ? data[i - 1].price : d.price;
        const close = d.price;
        // Ensure high/low are valid
        let high = d.maxPrice;
        let low = d.minPrice;

        // Fallback if max/min are missing, inconsistent, OR ZERO (bad data)
        if (!high || high <= 0) high = Math.max(open, close);
        if (!low || low <= 0) low = Math.min(open, close);

        // Ensure High is >= Low
        high = Math.max(high, Math.max(open, close));
        low = Math.min(low, Math.min(open, close));

        const isUp = close >= open;
        const color = isUp ? '#10B981' : '#EF4444'; // Green / Red

        return {
            ...d,
            open,
            close,
            high,
            low,
            // Range data for Recharts [min, max]
            wickRange: [low, high],
            bodyRange: [Math.min(open, close), Math.max(open, close)],
            color,
            dateStr: format(new Date(d.date), 'dd MMM', { locale: pl }),
            fullDateStr: format(new Date(d.date), 'd MMMM yyyy', { locale: pl }),
            volumeColor: '#8B5CF6'
        };
    }).filter(d => d.price > 0); // Extra safety: filter out completely dead points if any

    return (
        <div className="bg-[#1F2937] rounded-xl p-6 border border-gray-800 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg">Wykres Świecowy Kontraktu ({contract})</h3>
                <div className="flex gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-[#4B5563]"></span> DKR
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-blue-500"></span> SMA15
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-yellow-500"></span> SMA50
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-3 bg-red-500 rounded-sm"></span> CNDL
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-3 bg-purple-500 rounded-sm"></span> VOL
                    </div>
                </div>
            </div>

            {/* Price Chart */}
            <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        syncId="futuresSync"
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="dateStr"
                            height={0}
                            tick={false}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="price"
                            stroke="#9CA3AF"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            orientation="right"
                            tickFormatter={(val) => val.toFixed(0)}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#FFF'
                            }}
                            itemStyle={{ fontSize: '11px' }}
                            labelStyle={{ color: '#9CA3AF', marginBottom: '2px' }}

                            // Custom Tooltip Content to show OHLC and Volume nicely
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    // Extract data from the first payload item (should share the same original data object)
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-xs">
                                            <p className="text-gray-400 mb-2">{data.fullDateStr}</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-gray-400">Otwarcie:</span>
                                                    <span className="font-mono">{data.open.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-gray-400">Maksimum:</span>
                                                    <span className="font-mono">{data.high.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-gray-400">Minimum:</span>
                                                    <span className="font-mono">{data.low.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-gray-400">Zamknięcie:</span>
                                                    <span className="font-mono font-bold" style={{ color: data.color }}>{data.close.toFixed(2)}</span>
                                                </div>
                                                <div className="h-px bg-gray-700 my-2" />
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-blue-400">SMA15:</span>
                                                    <span className="font-mono text-blue-400">{data.sma15?.toFixed(2) || '-'}</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-yellow-500">SMA50:</span>
                                                    <span className="font-mono text-yellow-500">{data.sma50?.toFixed(2) || '-'}</span>
                                                </div>
                                                <div className="h-px bg-gray-700 my-2" />
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-purple-400">Wolumen:</span>
                                                    <span className="font-mono text-purple-400">{new Intl.NumberFormat('pl-PL').format(data.volume)} MWh</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        {/* Candlestick - Wick (Thin Range Bar) */}
                        <Bar
                            yAxisId="price"
                            dataKey="wickRange"
                            barSize={1}
                            isAnimationActive={false}
                            name="CandleWick"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-wick-${index}`} fill={entry.color} />
                            ))}
                        </Bar>

                        {/* Candlestick - Body (Thicker Range Bar) */}
                        <Bar
                            yAxisId="price"
                            dataKey="bodyRange"
                            barSize={6}
                            isAnimationActive={false}
                            name="CandleBody"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-body-${index}`} fill={entry.color} />
                            ))}
                        </Bar>

                        {/* DKR Line */}
                        <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="price"
                            stroke="#4B5563"
                            strokeWidth={1}
                            dot={false}
                            name="DKR"
                            activeDot={false}
                        />

                        {/* SMA Lines */}
                        <Line yAxisId="price" type="monotone" dataKey="sma15" stroke="#3B82F6" strokeWidth={1.5} dot={false} connectNulls name="SMA15" />
                        <Line yAxisId="price" type="monotone" dataKey="sma50" stroke="#EAB308" strokeWidth={1.5} dot={false} connectNulls name="SMA50" />

                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Volume Chart */}
            <div className="h-[120px] w-full mt-2" style={{ minHeight: '120px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        syncId="futuresSync"
                        margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="volGradientBottom" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="dateStr"
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            orientation="right"
                            tickFormatter={(val) => (val / 1000).toFixed(0) + 'k'}
                            domain={[0, 'auto']}
                        />
                        {/* Tooltip removed to 'move' info to top chart and avoid clutter */}
                        <Bar
                            dataKey="volume"
                            fill="url(#volGradientBottom)"
                            barSize={4}
                            name="Volume"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

