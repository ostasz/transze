import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { safeParseDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface FutureData {
    date: string;
    price: number;
}

interface FuturesChartProps {
    dataY1: FutureData[]; // Base Year (e.g. 2026)
    dataY2: FutureData[]; // Next Year (e.g. 2027)
    year1: string;
    year2: string;
    className?: string;
    height?: string | number;
    hideHeader?: boolean;
    extraHeaderContent?: React.ReactNode;
}

export default function FuturesChart({
    dataY1,
    dataY2,
    year1,
    year2,
    className,
    height = 400,
    hideHeader = false,
    extraHeaderContent
}: FuturesChartProps) {
    if ((!dataY1 || dataY1.length === 0) && (!dataY2 || dataY2.length === 0)) {
        return <div className="h-96 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">Brak danych do wyświetlenia</div>;
    }

    const allDates = new Set([
        ...dataY1.map(d => d.date),
        ...dataY2.map(d => d.date)
    ]);
    const sortedDates = Array.from(allDates).sort();

    const chartData = sortedDates.map(date => {
        const p1 = dataY1.find(d => d.date === date);
        const p2 = dataY2.find(d => d.date === date);
        const dObj = safeParseDate(date);

        return {
            date,
            [year1]: p1 ? p1.price : null,
            [year2]: p2 ? p2.price : null,
            displayDate: isNaN(dObj.getTime()) ? date : format(dObj, 'dd.MM')
        };
    });

    return (
        <div className={cn("bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm overflow-visible flex flex-col", className)}>
            {!hideHeader && (
                <div className="flex flex-col gap-3 mb-4 shrink-0">
                    <div className="flex flex-row justify-between items-start gap-2">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">Analiza Cenowa</h2>
                            <p className="text-xs text-gray-500 mt-1">Porównanie kontraktów rocznych</p>
                        </div>
                        {extraHeaderContent && (
                            <div className="shrink-0">
                                {extraHeaderContent}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 justify-end">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-[#134E4A]"></div>
                                <div className="w-4 h-0.5 bg-[#134E4A] -ml-1"></div>
                                <div className="w-2 h-2 rounded-full bg-[#134E4A] -ml-1"></div>
                            </div>
                            <span className="font-medium">Kontrakt {year1}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-[#F97316]"></div>
                                <div className="w-4 h-0.5 bg-[#F97316] border-t border-dashed border-[#F97316] -ml-1"></div>
                                <div className="w-2 h-2 rounded-full bg-[#F97316] -ml-1"></div>
                            </div>
                            <span className="font-medium">Kontrakt {year2}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="displayDate"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            tickFormatter={(val) => val.toFixed(0)}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#FFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                zIndex: 100
                            }}
                            wrapperStyle={{ zIndex: 100 }}
                            itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                            labelStyle={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}
                        />

                        <Line
                            type="monotone"
                            dataKey={year1}
                            name={`Kontrakt ${year1}`}
                            stroke="#134E4A"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#134E4A' }}
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey={year2}
                            name={`Kontrakt ${year2}`}
                            stroke="#F97316"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 6, fill: '#F97316' }}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
