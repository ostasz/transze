import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn exists, else standard string templating

interface FuturesLandscapeControlsRowProps {
    selectedContract: string;
    onContractChange: (c: string) => void;
    range: string;
    onRangeChange: (r: string) => void;
    selectedDate: string;
    onDateChange: (d: string) => void;
}

export default function FuturesLandscapeControlsRow({
    selectedContract,
    onContractChange,
    range,
    onRangeChange,
    selectedDate,
    onDateChange
}: FuturesLandscapeControlsRowProps) {
    const contracts = [
        "BASE_Y-26", "BASE_Y-27", "BASE_Y-28",
        "BASE_Q-1-26", "BASE_Q-2-26",
        "BASE_M-01-26", "BASE_M-02-26"
    ];

    const ranges = ['1M', '3M', '6M', 'YTD', 'ALL'];

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-[#1F2937] border-b border-gray-800 sticky top-12 z-40 gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
                {/* Compact Contract Select */}
                <div className="relative">
                    <div className="bg-gray-800 border border-gray-700 rounded px-2 py-1 flex items-center gap-1.5 min-w-[100px]">
                        <span className="text-white font-bold text-xs truncate">{selectedContract}</span>
                        <ChevronDown size={12} className="text-gray-400 ml-auto" />
                    </div>
                    <select
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        value={selectedContract}
                        onChange={(e) => onContractChange(e.target.value)}
                    >
                        {contracts.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Compact Date Picker */}
                <div className="relative">
                    <div className="bg-gray-800 border border-gray-700 rounded px-2 py-1 flex items-center gap-1.5">
                        <span className="text-white font-bold text-xs">{selectedDate}</span>
                        <Calendar size={12} className="text-gray-400" />
                    </div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                </div>
            </div>

            {/* Compact Range Toggle */}
            <div className="bg-gray-800 border border-gray-700 rounded p-0.5 flex items-center shrink-0">
                {ranges.map(r => (
                    <button
                        key={r}
                        onClick={() => onRangeChange(r)}
                        className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                            range === r ? 'bg-[#009D8F] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                        )}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>
    );
}
