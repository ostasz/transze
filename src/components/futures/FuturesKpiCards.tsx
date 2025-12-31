
import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface FuturesKpiCardsProps {
    stats: {
        totalVolume: number;
        volumeChange: number;
        totalOpenInterest: number;
        openInterestChange: number;
        topGainer: { contract: string; change: number; price: number } | null;
        topLoser: { contract: string; change: number; price: number } | null;
        volumeHistory: { date: string; val: number }[];
        oiHistory: { date: string; val: number }[];
    };
    onDateSelect?: (date: string) => void;
}

const TrendIcon = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2 ${isPositive ? 'bg-green-100 text-green-800' : isNeutral ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
            {isPositive ? '↑' : isNeutral ? '-' : '↓'} {Math.abs(value).toFixed(1)}%
        </span>
    );
};

export default function FuturesKpiCards({ stats }: FuturesKpiCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Volume */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Wolumen Obrotu</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.totalVolume.toLocaleString('pl-PL')} <span className="text-sm font-normal text-gray-400">MWh</span>
                        </h3>
                    </div>
                </div>
                <div className="flex items-center mt-1 mb-4">
                    <span className="text-xs text-gray-400">vs wczoraj</span>
                    <TrendIcon value={stats.volumeChange} />
                </div>
                {/* Mini Chart */}
                <div className="h-10 w-full absolute bottom-0 left-0 right-0 opacity-20">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.volumeHistory}>
                            <Area type="monotone" dataKey="val" stroke="#009D8F" fill="#009D8F" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Open Interest (LOP) */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Liczba Otwartych Pozycji (LOP)</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.totalOpenInterest.toLocaleString('pl-PL')} <span className="text-sm font-normal text-gray-400">MWh</span>
                        </h3>
                    </div>
                </div>
                <div className="flex items-center mt-1 mb-4">
                    <span className="text-xs text-gray-400">vs wczoraj</span>
                    <TrendIcon value={stats.openInterestChange} />
                </div>
                <div className="h-10 w-full absolute bottom-0 left-0 right-0 opacity-20">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.oiHistory}>
                            <Area type="monotone" dataKey="val" stroke="#6366F1" fill="#6366F1" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Top Gainer */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Największy Wzrost</p>
                        {stats.topGainer ? (
                            <>
                                <h3 className="text-lg font-bold text-green-600 mt-1 truncate max-w-[150px]" title={stats.topGainer.contract}>
                                    {stats.topGainer.contract}
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.topGainer.price.toFixed(2)} <span className="text-xs text-gray-400">PLN/MWh</span>
                                </p>
                            </>
                        ) : (
                            <h3 className="text-lg font-bold text-gray-400 mt-1">-</h3>
                        )}
                    </div>
                    {stats.topGainer && (
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                            +{stats.topGainer.change.toFixed(2)}%
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Top Loser */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Największy Spadek</p>
                        {stats.topLoser ? (
                            <>
                                <h3 className="text-lg font-bold text-red-600 mt-1 truncate max-w-[150px]" title={stats.topLoser.contract}>
                                    {stats.topLoser.contract}
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.topLoser.price.toFixed(2)} <span className="text-xs text-gray-400">PLN/MWh</span>
                                </p>
                            </>
                        ) : (
                            <h3 className="text-lg font-bold text-gray-400 mt-1">-</h3>
                        )}
                    </div>
                    {stats.topLoser && (
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">
                            {stats.topLoser.change.toFixed(2)}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
