
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import FuturesHeader from '@/components/futures2/FuturesHeader';
import FuturesAdvKPI from '@/components/futures2/FuturesAdvKPI';
import FuturesTechnicalKPI from '@/components/futures2/FuturesTechnicalKPI';
import FuturesCandleChart from '@/components/futures2/FuturesCandleChart';
import ForwardCurveChart from '@/components/futures2/ForwardCurveChart';
import FuturesTicker from '@/components/futures2/FuturesTicker';

export default function FuturesPage2() {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = (new Date().getFullYear() + 1).toString().slice(-2);
    const [selectedContract, setSelectedContract] = useState(`BASE_Y-${nextYear}`);
    const [selectedDate, setSelectedDate] = useState(today);
    const [timeRange, setTimeRange] = useState('6M'); // 1M, 3M, 6M, YTD, 1Y

    // Data State
    const [history, setHistory] = useState<any[]>([]);
    const [kpi, setKpi] = useState<any>(null);
    const [technical, setTechnical] = useState<any>(null);
    const [forwardCurve, setForwardCurve] = useState<any[]>([]);
    const [ticker, setTicker] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/energy-prices/futures/details?contract=${selectedContract}&date=${selectedDate}`);
                if (res.ok) {
                    const json = await res.json();
                    setHistory(json.history || []);
                    setKpi(json.kpi || {});
                    setTechnical(json.technical || null);
                    setForwardCurve(json.forwardCurve || []);
                    setTicker(json.ticker || []);

                    // If API returns an effective date (e.g. snapped to latest available), update UI
                    if (json.effectiveDate && json.effectiveDate !== selectedDate) {
                        setSelectedDate(json.effectiveDate);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch futures details', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedContract, selectedDate]);

    // Filter history based on time range
    // Filter history based on time range relative to SELECTED DATE
    const filterData = () => {
        if (!history.length) return [];

        // Anchor is the selected valuation date (end of day to include current day data)
        const anchor = new Date(selectedDate);
        anchor.setHours(23, 59, 59, 999);
        let cutoff = new Date(anchor);

        switch (timeRange) {
            case '1M': cutoff.setMonth(anchor.getMonth() - 1); break;
            case '3M': cutoff.setMonth(anchor.getMonth() - 3); break;
            case '6M': cutoff.setMonth(anchor.getMonth() - 6); break;
            case 'YTD': cutoff = new Date(anchor.getFullYear(), 0, 1); break;
            case 'ALL': cutoff = new Date('2000-01-01'); break; // Show all history UP TO selected date
            default: cutoff.setMonth(anchor.getMonth() - 6);
        }

        return history.filter(d => {
            const date = new Date(d.date);
            // Show data between cutoff and selected date (inclusive)
            return date >= cutoff && date <= anchor;
        });
    };

    const filteredHistory = filterData();

    return (
        <div className="text-gray-100 font-sans p-6">
            {/* Header */}
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-[#1F2937] p-4 rounded-xl border border-gray-800 shadow-sm gap-4 sticky top-0 z-50">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Centrum Analiz Futures</h1>
                        <p className="text-xs text-gray-400">Widok Zaawansowany (PRO)</p>
                    </div>
                </div>

                {/* Integrated Controls */}
                <div className="flex items-center gap-4">
                    <FuturesHeader
                        selectedContract={selectedContract}
                        onContractChange={setSelectedContract}
                        range={timeRange}
                        onRangeChange={setTimeRange}
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                    />

                    <div className="h-8 w-px bg-gray-700 mx-2 hidden md:block"></div>

                    {/* View Toggle */}
                    <div className="bg-gray-900 p-1 rounded-lg flex items-center border border-gray-700">
                        <Link href="/futures" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Simple
                        </Link>
                        <span className="px-3 py-1.5 rounded-md text-sm font-bold bg-[#009D8F] text-white shadow-sm cursor-default">
                            Pro
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="space-y-6 pb-12">
                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="text-blue-400 font-mono text-sm animate-pulse">Ładowanie danych giełdowych...</div>
                    </div>
                ) : (
                    <>
                        {/* KPI SECTION */}
                        {kpi && <FuturesAdvKPI data={kpi} contract={selectedContract} />}

                        {/* TECHNICAL INDICATORS */}
                        {technical && <FuturesTechnicalKPI data={technical} contract={selectedContract} />}

                        {/* MAIN CHART */}
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                            <FuturesCandleChart data={filteredHistory} contract={selectedContract} />
                        </div>

                        {/* BOTTOM SECTION: CURVE + TICKER */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <ForwardCurveChart data={forwardCurve} />
                            </div>
                            <div>
                                <FuturesTicker data={ticker} />
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
