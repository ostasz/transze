'use client';

import { useState, useEffect } from 'react';
import FuturesKPI from '@/components/futures/FuturesKPI';
import FuturesKPICompact from '@/components/futures/FuturesKPICompact';
import FuturesChart from '@/components/futures/FuturesChart';
import { ArrowLeft, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { safeFormatDate, safeParseDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import ModeToggle from '@/components/futures/ModeToggle';

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
    const router = useRouter();
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

                    const d1 = json.futures[year1] || [];
                    const d2 = json.futures[year2] || [];

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
        <>
            {/* ========================================= */}
            {/* STANDARD LAYOUT (Portrait Mobile + Desktop) */}
            {/* ========================================= */}
            <div className="block landscape:hidden lg:landscape:block p-4 md:p-0 pb-[calc(80px+env(safe-area-inset-bottom))]">
                {/* Header - Static, no flicker/sticky on mobile portrait */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
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
                    <div className="w-full md:w-auto flex justify-center">
                        <ModeToggle
                            value="basic"
                            onChange={(val) => {
                                if (val === 'pro') router.push('/apps/futures2');
                            }}
                        />
                    </div>
                </header>

                {/* Main Content */}
                <main className="space-y-6">
                    {loading ? (
                        <div className="h-96 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#2DD4BF] rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* KPI Slider (Mobile) / Grid (Desktop) */}
                            {/* Uses horizontal snap scroll on mobile to save vertical space */}
                            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-2 scroll-smooth no-scrollbar md:grid md:grid-cols-2 md:gap-6 md:mx-0 md:px-0 md:pb-0">
                                <div className="w-[85vw] md:w-auto flex-shrink-0 snap-center">
                                    <FuturesKPI year={year1} data={filteredDataY1} label={`BASELINE ${year1}`} color="teal" />
                                </div>
                                <div className="w-[85vw] md:w-auto flex-shrink-0 snap-center">
                                    <FuturesKPI year={year2} data={filteredDataY2} label={`BASELINE ${year2}`} color="orange" />
                                </div>
                            </div>

                            {/* Main Chart */}
                            {/* Controls integrated into header */}
                            <FuturesChart
                                dataY1={filteredDataY1}
                                dataY2={filteredDataY2}
                                year1={year1}
                                year2={year2}
                                height="100%"
                                className="h-[450px] md:h-[500px]"
                                extraHeaderContent={
                                    <div className="flex items-center gap-2 bg-gray-50 p-0.5 md:p-1 rounded-lg border border-gray-200">
                                        {[30, 90, 365].map((days) => (
                                            <button
                                                key={days}
                                                onClick={() => setTimeRange(days)}
                                                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all ${timeRange === days
                                                    ? 'bg-[#009D8F] text-white shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {days} Dni
                                            </button>
                                        ))}
                                    </div>
                                }
                            />
                        </>
                    )}
                </main>
            </div>

            {/* ========================================= */}
            {/* MOBILE LANDSCAPE COMPACT LAYOUT */}
            {/* ========================================= */}
            <div className="hidden landscape:flex lg:landscape:hidden flex-col h-[100dvh] w-full bg-white fixed inset-0 z-50 overflow-hidden pb-[48px] box-border safe-area-bottom">

                {/* 1. Thin Toolbar (Sticky) */}
                <div className="h-10 border-b flex items-center px-4 justify-between bg-white shrink-0 shadow-sm z-30 relative">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#009D8F]/10 p-1 rounded text-[#009D8F] flex items-center justify-center">
                            <span className="text-xs">⚡</span>
                        </div>
                        <h1 className="text-sm font-bold text-gray-900">Futures</h1>
                    </div>

                    {/* Compact View Toggle */}
                    <div className="flex bg-gray-100 p-0.5 rounded text-[10px] font-bold border border-gray-200">
                        <span className="px-2 py-0.5 bg-white rounded shadow-sm text-gray-900">Simple</span>
                        <Link href="/apps/futures2" className="px-2 py-0.5 text-gray-500 hover:text-gray-900">Pro</Link>
                    </div>
                </div>

                {/* 2. Main Content (Single Panel) */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    <div className="p-2 pb-0 flex flex-col gap-2 shrink-0">
                        {/* Time Range Controls */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">Zakres:</span>
                            <div className="flex gap-1.5 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                                {[30, 90, 365].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setTimeRange(days)}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${timeRange === days
                                            ? 'bg-white text-[#009D8F] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        {days} Dni
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* KPIs */}
                        {loading ? (
                            <div className="h-20 w-full flex items-center justify-center border rounded-lg bg-gray-50">
                                <div className="w-5 h-5 border-2 border-gray-200 border-t-[#2DD4BF] rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <FuturesKPICompact year={year1} data={filteredDataY1} label={`BASE ${year1}`} color="teal" />
                                <FuturesKPICompact year={year2} data={filteredDataY2} label={`BASE ${year2}`} color="orange" />
                            </div>
                        )}
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 w-full min-h-0 relative p-2 pt-0">
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#2DD4BF] rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="h-full w-full relative">
                                <FuturesChart
                                    dataY1={filteredDataY1}
                                    dataY2={filteredDataY2}
                                    year1={year1}
                                    year2={year2}
                                    height="100%"
                                    hideHeader={true}
                                    className="h-full w-full p-0 border-none shadow-none bg-transparent"
                                />

                                {/* Legend Overlay */}
                                <div className="absolute top-2 right-4 flex items-center gap-3 bg-white/80 backdrop-blur px-2 py-1 rounded-full border shadow-sm z-10 pointer-events-none">
                                    <div className="flex items-center gap-1.5 text-[10px]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#134E4A]"></div>
                                        <span className="font-semibold text-gray-700">{year1}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></div>
                                        <span className="font-semibold text-gray-700">{year2}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
