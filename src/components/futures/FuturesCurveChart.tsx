
import React from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

interface FuturesCurveChartProps {
    data: {
        contract: string;
        price: number;
        volume: number;
    }[];
}

export default function FuturesCurveChart({ data }: FuturesCurveChartProps) {
    if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400">Brak danych dla wykresu</div>;

    // Filter out contracts with abnormally high/low prices or 0 price if strict
    const cleanData = data.filter(d => d.price > 0);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Krzywa Terminowa (Forward Curve)</h3>
                <p className="text-sm text-gray-500">Ceny rozliczeniowe (PLN/MWh) oraz wolumen (MWh) dla poszczególnych kontraktów</p>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={cleanData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }} // Extra bottom margin for XAxis labels
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="contract"
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            height={60}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#1F2937"
                            width={50}
                            tick={{ fontSize: 11 }}
                            domain={['auto', 'auto']}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#9CA3AF"
                            width={50}
                            tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        <Bar
                            yAxisId="right"
                            dataKey="volume"
                            name="Wolumen (MWh)"
                            fill="#E5E7EB"
                            barSize={20}
                            opacity={0.8}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="price"
                            name="Cena (PLN/MWh)"
                            stroke="#009D8F"
                            strokeWidth={3}
                            dot={{ r: 3, fill: '#009D8F', strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
