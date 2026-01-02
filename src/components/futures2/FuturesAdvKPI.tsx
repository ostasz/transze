import React from 'react';
import { TrendingUp, TrendingDown, Activity, Battery } from 'lucide-react';
import { FuturesKpiDto } from './types';
import { cn } from '@/lib/utils';

interface KPIProps {
    data: FuturesKpiDto;
    contract: string;
    className?: string; // Add className prop
    compact?: boolean;  // Add compact prop
}

export default function FuturesAdvKPI({ data, contract, className, compact }: KPIProps) {
    if (!data) return null;

    // A) Fix: Proper 0 handling (0 is valid price, null/NaN is not)
    const formatPrice = (v?: number | null) =>
        (v === null || v === undefined || Number.isNaN(v)) ? '-.--' : v.toFixed(2);

    // B) Fix: Safe spread status logic
    const getSpreadStatus = (change: number = 0) => {
        if (!Number.isFinite(change)) return { label: 'Brak Danych', color: 'text-gray-500' };
        if (change > 0.5) return { label: 'Rosnący (Widening)', color: 'text-orange-400' };
        if (change < -0.5) return { label: 'Malejący (Narrowing)', color: 'text-blue-400' };
        return { label: 'Stabilny', color: 'text-gray-500' };
    };

    const spreadStatus = getSpreadStatus(data.spreadChange);

    // Helper for rendering trend percentage safely
    const renderTrend = (changePct?: number) => {
        if (changePct === undefined || changePct === null) return null;

        const isPositive = changePct >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const color = isPositive ? 'text-[#00C1B5]' : 'text-red-400';

        return (
            <div className={`mt-2 flex items-center gap-1 ${color} text-sm`}>
                <Icon size={16} aria-hidden="true" />
                <span>{isPositive ? '+' : ''}{changePct.toFixed(1)}% vs Wczoraj</span>
            </div>
        );
    };

    // E) Safe volume/OI
    const safeVolume = Number.isFinite(data.volume) ? data.volume : 0;
    const safeOpenInterest = Number.isFinite(data.openInterest) ? data.openInterest : 0;

    // Adjust padding based on compact prop
    const cardPadding = compact ? 'p-3' : 'p-5';
    const titleSize = compact ? 'text-[10px]' : 'text-xs';
    const priceSize = compact ? 'text-2xl' : 'text-3xl';

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-4", className)}>
            {/* BASE Card */}
            <div className={cn("bg-[#1E293B] text-white rounded-xl shadow-sm border border-gray-700 relative overflow-hidden group", cardPadding)}>
                {!compact && (
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={48} className="text-[#009D8F]" aria-hidden="true" />
                    </div>
                )}
                <div className={`text-gray-400 font-medium uppercase tracking-wider mb-1 ${titleSize}`}>
                    BASE {contract}
                </div>
                <div className={`${priceSize} font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400`}>
                    {formatPrice(data.basePrice)} <span className="text-sm font-normal text-gray-500">PLN/MWh</span>
                </div>
                {renderTrend(data.baseChangePct)}
            </div>

            {/* PEAK Card */}
            <div className={cn("bg-[#1E293B] text-white rounded-xl shadow-sm border border-gray-700 relative overflow-hidden group", cardPadding)}>
                {!compact && (
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Battery size={48} className="text-[#009D8F]" aria-hidden="true" />
                    </div>
                )}
                <div className={`text-gray-400 font-medium uppercase tracking-wider mb-1 ${titleSize}`}>
                    {/* D) Improved contract naming robust against missing 'BASE' */}
                    PEAK {contract.includes('BASE') ? contract.replace('BASE', 'PEAK') : `${contract} (PEAK)`}
                </div>
                <div className={`${priceSize} font-bold text-white`}>
                    {formatPrice(data.peakPrice)} <span className="text-sm font-normal text-gray-500">PLN/MWh</span>
                </div>
                {renderTrend(data.peakChangePct)}
            </div>

            {/* SPREAD Card */}
            <div className={cn("bg-[#1E293B] text-white rounded-xl shadow-sm border border-gray-700", cardPadding)}>
                <div className={`text-gray-400 font-medium uppercase tracking-wider mb-1 ${titleSize}`}>
                    Spread BASE/PEAK
                </div>
                <div className={`${priceSize} font-bold text-[#009D8F]`}>
                    {formatPrice(data.spread)} <span className="text-sm font-normal text-gray-500">PLN</span>
                </div>
                <div className={`text-xs mt-4 text-center ${spreadStatus.color}`}>
                    {spreadStatus.label} ({data.spreadChange ? (data.spreadChange > 0 ? '+' : '') + data.spreadChange.toFixed(2) : '0.00'})
                </div>
            </div>

            {/* VOL/LOP Card */}
            <div className={cn("bg-[#1E293B] text-white rounded-xl shadow-sm border border-gray-700", cardPadding)}>
                <div className={`text-gray-400 font-medium uppercase tracking-wider mb-1 ${titleSize}`}>
                    Całkowity Wolumen / LOP
                </div>
                <div className="flex flex-col">
                    <div className={`font-bold text-[#A78BFA] ${compact ? 'text-xl' : 'text-2xl'}`}>
                        {(safeVolume / 1000).toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k <span className="text-sm text-gray-500">MWh</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        LOP: {safeOpenInterest.toLocaleString('pl-PL')}
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[#00C1B5] text-sm justify-end">
                    <TrendingUp size={14} aria-hidden="true" />
                    <span>Active</span>
                </div>
            </div>
        </div>
    );
}
