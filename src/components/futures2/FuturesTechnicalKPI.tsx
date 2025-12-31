
import React from 'react';
import { TrendingUp, AlertTriangle, Layers, Activity } from 'lucide-react';

interface FuturesTechnicalKPIProps {
    data: {
        rsi: number;
        atr: number;
        calendarSpread: number;
        trendStrength: number;
        sma50: number;
    };
    contract: string;
}

export default function FuturesTechnicalKPI({ data, contract }: FuturesTechnicalKPIProps) {
    if (!data) return null;

    // RSI Colors: 30-70 is Yellow/Neutral in screenshot
    const rsiColor = data.rsi > 70 ? 'text-red-500' : data.rsi < 30 ? 'text-green-500' : 'text-yellow-400';
    const rsiBarColor = data.rsi > 70 ? 'bg-red-500' : data.rsi < 30 ? 'bg-green-500' : 'bg-yellow-400';
    const rsiStatus = data.rsi > 70 ? 'Wykupienie (Overbought)' : data.rsi < 30 ? 'Wyprzedanie (Oversold)' : 'NEUTRALNY';

    // Trend Logic
    const trendText = Math.abs(data.trendStrength || 0) < 1 ? 'NEUTRALNY' : (data.trendStrength || 0) > 0 ? 'WZROSTOWY' : 'SPADKOWY';
    const trendColor = Math.abs(data.trendStrength || 0) < 1 ? 'text-gray-300' : (data.trendStrength || 0) > 0 ? 'text-[#2DD4BF]' : 'text-red-400';
    const trendStatus = Math.abs(data.trendStrength || 0) < 1 ? 'NEUTRAL' : (data.trendStrength || 0) > 0 ? 'BULLISH' : 'BEARISH';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* RSI */}
            <div className="bg-[#1F2937] rounded-xl p-5 border border-gray-800 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">RSI (14) - MOMENTUM</p>
                    <Activity size={16} className="text-gray-600 opacity-50" />
                </div>
                <h3 className={`text-3xl font-bold tracking-tight ${rsiColor}`}>
                    {data.rsi?.toFixed(2)}
                </h3>
                <p className="text-xs text-gray-500 mt-1 uppercase">{rsiStatus}</p>
                {/* Progress Bar */}
                <div className="w-full bg-gray-700/50 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div
                        className={`h-full ${rsiBarColor} rounded-full`}
                        style={{ width: `${Math.min(Math.max(data.rsi || 0, 0), 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* ATR */}
            <div className="bg-[#1F2937] rounded-xl p-5 border border-gray-800 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-orange-400 text-[10px] uppercase font-bold tracking-wider">ATR (14) - RYZYKO ZMIENNOŚCI</p>
                </div>
                {/* Bg Icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-orange-400">
                    <AlertTriangle size={48} strokeWidth={1} />
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                    <h3 className="text-3xl font-bold text-white tracking-tight">{data.atr?.toFixed(2)}</h3>
                    <span className="text-gray-500 text-xs font-medium">PLN</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 relative z-10">Średnia dzienna zmiana ceny</p>
            </div>

            {/* Calendar Spread (Placeholder) */}
            <div className="bg-[#1F2937] rounded-xl p-5 border border-gray-800 shadow-lg relative overflow-hidden">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-purple-400">
                    <Layers size={48} strokeWidth={1} />
                </div>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">CALENDAR SPREAD (Y vs Y+1)</p>
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                    <h3 className="text-3xl font-bold text-[#2DD4BF] tracking-tight">{data.calendarSpread?.toFixed(2) || '26.30'}</h3>
                    <span className="text-gray-500 text-xs font-medium">PLN</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 relative z-10">Struktura: <span className="text-[#2DD4BF]">Backwardation</span></p>
                <p className="text-[10px] text-gray-600 mt-0.5 relative z-10">Obecny rok droższy (Backwardation)</p>
            </div>

            {/* Trend Strength */}
            <div className="bg-[#1F2937] rounded-xl p-5 border border-gray-800 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">SIŁA TRENDU (VS SMA50)</p>
                    <div className="flex gap-1">
                        <div className="w-1 h-3 bg-gray-600 rounded-sm"></div>
                        <div className="w-1 h-4 bg-gray-500 rounded-sm"></div>
                        <div className="w-1 h-3 bg-gray-600 rounded-sm"></div>
                    </div>
                </div>
                <h3 className={`text-3xl font-bold tracking-tight ${trendColor} uppercase`}>
                    {trendText}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                    Stan: <span className="text-gray-300 font-medium">{trendStatus}</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-2">Analiza Trendu</p>

                <div className="w-full bg-gray-700/50 h-1 mt-2 rounded-full relative">
                    {/* Neutral Center Bar */}
                    <div className="h-full bg-gray-600/50 w-2/3 mx-auto rounded-full"></div>
                </div>
            </div>

        </div>
    );
}
