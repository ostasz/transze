
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface ForwardCurveChartProps {
    data: any[];
}

export default function ForwardCurveChart({ data }: ForwardCurveChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-[#1F2937] rounded-xl p-6 border border-gray-800 shadow-lg">
            <h3 className="text-white font-bold text-lg mb-6">Krzywa Terminowa (Forward Curve)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="label"
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#FFF',
                                padding: '8px 12px'
                            }}
                            itemStyle={{ fontSize: '13px', paddingTop: '2px', paddingBottom: '2px' }}
                            labelStyle={{ color: '#9CA3AF', marginBottom: '8px', fontSize: '12px' }}
                            formatter={(value: any, name: any) => {
                                const valStr = Number(value).toFixed(2) + ' PLN';
                                if (name === 'price') return [valStr, 'Cena'];
                                if (name === 'sma15') return [valStr, 'SMA15'];
                                return [valStr, name];
                            }}
                        />

                        {/* SMA15 Line */}
                        <Line
                            type="monotone"
                            dataKey="sma15"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={false}
                            name="sma15"
                        />

                        {/* Main Price Line */}
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#2DD4BF"
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#2DD4BF', strokeWidth: 2, stroke: '#1F2937' }}
                            activeDot={{ r: 7, strokeWidth: 2, stroke: '#FFF' }}
                            name="price"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
