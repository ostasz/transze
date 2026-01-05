
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from "recharts";
import { ArrowRight, BarChart3, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { addDays, format, subDays, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";

interface ChartDataPoint {
    hour: string;
    price: number | null;
    volume: number | null;
    priceYesterday: number | null;
    priceAvg: number | null;
}

export function RdnSnapshotCard() {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch last 14 days to ensure we have enough for 7-day avg and yesterday even with gaps
                const res = await fetch('/api/energy-prices/history?days=14');
                const json = await res.json();
                const history = json.fullHourlyHistory || [];

                // Sort descending: Index 0 is Latest
                const sorted = [...history].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                const latest = sorted[0];
                const yesterday = sorted[1]; // Assuming contiguous dates, otherwise find by date

                // 7-Day Average (Indices 0 to 6)
                const last7Days = sorted.slice(0, 7);

                if (latest) {
                    const deliveryDate = addDays(new Date(latest.date), 1);
                    setCurrentDate(format(deliveryDate, 'd MMMM yyyy', { locale: pl }));

                    const points: ChartDataPoint[] = [];

                    for (let i = 0; i < 24; i++) {
                        // Current Price & Volume
                        const price = latest.prices[i] ?? null;
                        const volume = latest.volumes ? latest.volumes[i] : null;

                        // Yesterday Price
                        const priceYest = yesterday && yesterday.prices ? yesterday.prices[i] : null;

                        // Avg Price
                        let sum = 0;
                        let count = 0;
                        last7Days.forEach(day => {
                            if (day.prices && day.prices[i] !== undefined) {
                                sum += day.prices[i];
                                count++;
                            }
                        });
                        const avg = count > 0 ? sum / count : null;

                        points.push({
                            hour: (i + 1).toString().padStart(2, '0'),
                            price,
                            volume,
                            priceYesterday: priceYest,
                            priceAvg: avg
                        });
                    }
                    setChartData(points);
                }
            } catch (e) {
                console.error("Failed to fetch RDN complex data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <Card className="h-full flex flex-col shadow-sm justify-center items-center p-4 min-h-[400px]">
            <span className="text-xs text-muted-foreground">Ładowanie analizy godzinowej RDN...</span>
        </Card>
    );

    return (
        <Card className="h-[380px] flex flex-col shadow-sm border-none bg-white">
            <CardHeader className="p-4 pb-2">
                <div className="flex flex-col space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900">
                        Przebieg godzinowy (Fixing I)
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                        Dostawa: {currentDate}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -15, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E5E7EB" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#E5E7EB" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F3F4F6" />

                        {/* X Axis */}
                        <XAxis
                            dataKey="hour"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            dy={5}
                            interval={2}
                        />

                        {/* Left Y Axis - Price */}
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            domain={['auto', 'auto']}
                        />

                        {/* Right Y Axis - Volume */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                            tick={{ fill: '#9CA3AF', fontSize: 10 }}
                            width={30}
                        />

                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '4px' }}
                            formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value}
                        />

                        <Legend
                            verticalAlign="top"
                            height={30}
                            content={renderLegend}
                        />

                        {/* Volume Bar */}
                        <Bar
                            yAxisId="right"
                            dataKey="volume"
                            name="Wolumen"
                            fill="#D1D5DB"
                            barSize={20}
                            radius={[4, 4, 0, 0]}
                        />

                        {/* Yesterday Line (Dashed Orange) */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="priceYesterday"
                            name="Wczoraj"
                            stroke="#F97316"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* Avg Line (Purple) */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="priceAvg"
                            name="Średnia (7 dni)"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* Current Price Line (Dark Green with Dots) */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="price"
                            name="Cena (PLN/MWh)"
                            stroke="#064E3B"
                            strokeWidth={3}
                            dot={{ fill: '#064E3B', r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 7 }}
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

const renderLegend = (props: any) => {
    const { payload } = props;
    return (
        <div className="flex flex-wrap justify-center gap-6 mb-4 text-xs font-medium text-gray-600">
            {payload.map((entry: any, index: number) => {
                let icon;
                if (entry.value === 'Cena (PLN/MWh)') {
                    icon = <div className="w-2.5 h-2.5 rounded-full bg-[#064E3B] border-2 border-[#064E3B] bg-white ring-1 ring-[#064E3B]" style={{ backgroundColor: 'white', borderColor: '#064E3B' }} />; // Hollow dot simulation or just color
                    // Actually simpler to match screenshot: Line with dot.
                    icon = <div className="flex items-center"><div className="w-4 h-0.5 bg-[#064E3B]"></div><div className="w-2 h-2 rounded-full bg-[#064E3B] -ml-3 border border-white"></div></div>
                } else if (entry.value === 'Wczoraj') {
                    icon = <div className="w-4 h-0.5 border-t-2 border-dashed border-[#F97316]"></div>
                } else if (entry.value === 'Wolumen') {
                    icon = <div className="w-3 h-3 bg-[#D1D5DB] rounded-sm"></div>
                } else if (entry.value === 'Średnia (7 dni)') {
                    icon = <div className="flex items-center"><div className="w-4 h-0.5 bg-[#8B5CF6]"></div><div className="w-1.5 h-1.5 rounded-full bg-white border border-[#8B5CF6] -ml-2.5"></div></div>
                }

                return (
                    <div key={`item-${index}`} className="flex items-center gap-2">
                        {icon}
                        <span className="text-gray-700">{entry.value}</span>
                    </div>
                );
            })}
        </div>
    );
}
