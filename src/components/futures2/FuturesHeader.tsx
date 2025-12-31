
import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface FuturesHeaderProps {
    selectedContract: string;
    onContractChange: (c: string) => void;
    range: string;
    onRangeChange: (r: string) => void;
    selectedDate: string;
    onDateChange: (d: string) => void;
}

export default function FuturesHeader({
    selectedContract,
    onContractChange,
    range,
    onRangeChange,
    selectedDate,
    onDateChange
}: FuturesHeaderProps) {
    // Common TGE Contracts to pick from
    // In a real app, this list might come from API or be dynamic
    const contracts = [
        "BASE_Y-26", "BASE_Y-27", "BASE_Y-28",
        "BASE_Q-1-26", "BASE_Q-2-26",
        "BASE_M-01-26", "BASE_M-02-26"
    ];

    const ranges = ['1M', '3M', '6M', 'YTD', 'ALL'];

    return (
        <div className="flex items-center gap-4">
            {/* Contract Selector */}
            <div className="relative group">
                <div className="bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Produkt</span>
                        <span className="text-white font-bold text-sm">{selectedContract}</span>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-white" />
                </div>
                {/* Dropdown would go here, simplified for now to standard select if needed, or custom UI */}
                <select
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    value={selectedContract}
                    onChange={(e) => onContractChange(e.target.value)}
                >
                    {contracts.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Date Picker */}
            <div className="bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-1.5 flex items-center gap-2 relative">
                <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Data Wyceny</span>
                    <input
                        type="date"
                        value={selectedDate} // formatted YYYY-MM-DD
                        onChange={(e) => onDateChange(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    />
                    <span className="text-white font-bold text-sm pointer-events-none">{selectedDate}</span>
                </div>
                <Calendar size={14} className="text-gray-400" />
            </div>

            {/* Range Toggle */}
            <div className="bg-[#1F2937] border border-gray-700 rounded-lg p-1 flex items-center">
                {ranges.map(r => (
                    <button
                        key={r}
                        onClick={() => onRangeChange(r)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${range === r
                            ? 'bg-[#009D8F] text-white shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>
    );
}
