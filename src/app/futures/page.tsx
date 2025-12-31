
'use client';

import { useState, useEffect } from 'react';
import FuturesKPI from '@/components/futures/FuturesKPI';
import FuturesChart from '@/components/futures/FuturesChart';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { safeFormatDate, safeParseDate } from '@/lib/date-utils';

interface FutureData {
    date: string;
    price: number;
}

interface FuturesResponse {
    futures: {
        [year: string]: FutureData[];
    };
}

export default function FuturesPage() {
    const [dataY1, setDataY1] = useState<FutureData[]>([]);
    const [dataY2, setDataY2] = useState<FutureData[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<number>(30); // Default to 30 days

    const currentYear = new Date().getFullYear();
    const year1 = (currentYear + 1).toString();
    const year2 = (currentYear + 2).toString();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Limit=0 fetches ALL history
                const res = await fetch('/api/energy-prices/futures?limit=0');
                if (res.ok) {
                    const json: FuturesResponse = await res.json();

                    // Fix invalid date strings if necessary (client side patch just in case)
                    // But assume API and db are fixed now. 
                    // However, sorting should be safe.
                    const d1 = json.futures[year1] || [];
                    const d2 = json.futures[year2] || [];

                    // Sort to ensure chart correctness
                    // Sort to ensure chart correctness
                    d1.sort((a, b) => safeParseDate(a.date).getTime() - safeParseDate(b.date).getTime());
                    d2.sort((a, b) => safeParseDate(a.date).getTime() - safeParseDate(b.date).getTime());

                    setDataY1(d1);
                    setDataY2(d2);
                }
            } catch (error) {
                console.error('Failed to fetch futures data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year1, year2]);

    // Filter data based on selected time range
    const filteredDataY1 = dataY1.slice(-timeRange);
    const filteredDataY2 = dataY2.slice(-timeRange);

    return (
        <div className="font-sans p-6 text-gray-900">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4 sticky top-0 z-50">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-[#009D8F]/10 p-2 rounded-lg text-[#009D8F]">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Centrum Analiz Futures</h1>
                        <p className="text-xs text-gray-500">Przegląd podstawowy</p>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="bg-gray-100 p-1 rounded-lg flex items-center border border-gray-200">
                    <span className="px-3 py-1.5 rounded-md text-sm font-bold bg-white text-gray-900 shadow-sm cursor-default border border-gray-100">
                        Simple
                    </span>
                    <Link href="/apps/futures2" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        Pro
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="space-y-6 pb-12">
                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#2DD4BF] rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturesKPI year={year1} data={filteredDataY1} label={`BASELINE ${year1}`} color="teal" />
                            <FuturesKPI year={year2} data={filteredDataY2} label={`BASELINE ${year2}`} color="orange" />
                        </div>

                        {/* Main Chart */}
                        <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex justify-end items-center mb-4">
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                    {[30, 90, 365].map((days) => (
                                        <button
                                            key={days}
                                            onClick={() => setTimeRange(days)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${timeRange === days
                                                ? 'bg-[#009D8F] text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                                }`}
                                        >
                                            {days} Dni
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <FuturesChart
                                dataY1={filteredDataY1}
                                dataY2={filteredDataY2}
                                year1={year1}
                                year2={year2}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
