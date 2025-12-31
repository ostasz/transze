'use client';

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Rdn2HourlyChartProps {
    data: any[];
}

export default function Rdn2HourlyChart({ data }: Rdn2HourlyChartProps) {
    if (!data) return null;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-xl shadow-lg text-sm">
                    <p className="font-bold text-gray-900 mb-2">Godzina {label}</p>
                    {payload.sort((a: any, b: any) => {
                        const order: Record<string, number> = {
                            'Cena (PLN/MWh)': 0,
                            'Wczoraj': 1,
                            'Średnia (7 dni)': 2,
                            'Wolumen': 3
                        };
                        return (order[a.name] ?? 10) - (order[b.name] ?? 10);
                    }).map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-gray-500">{entry.name}:</span>
                            <span className="font-mono font-medium">
                                {entry.value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {entry.dataKey === 'volume' ? ' MWh' : ' PLN'}
                            </span>
                        </div>
                    ))}
                    {payload[0].payload.change !== 0 && (
                        <div className={`mt-2 text-xs font-bold ${payload[0].payload.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            Zmiana d/d: {payload[0].payload.change > 0 ? '+' : ''}{payload[0].payload.change.toFixed(2)}%
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[450px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Przebieg godzinowy (Fixing I)</h2>
                    <p className="text-xs text-gray-500">Cena i wolumen w ujęciu godzinowym</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val: number) => val.toFixed(0)}
                        width={40}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val: number) => (val / 1000).toFixed(1) + 'k'}
                        width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />

                    {/* Volume Bar */}
                    <Bar
                        yAxisId="right"
                        dataKey="volume"
                        name="Wolumen"
                        fill="#334155"
                        opacity={0.2}
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />

                    {/* Historical References */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="priceAvgWeek"
                        name="Średnia (7 dni)"
                        stroke="#7C3AED"
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="priceYesterday"
                        name="Wczoraj"
                        stroke="#F97316"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                    />

                    {/* Main Price Line */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="price"
                        name="Cena (PLN/MWh)"
                        stroke="#134E4A"
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#134E4A', strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
