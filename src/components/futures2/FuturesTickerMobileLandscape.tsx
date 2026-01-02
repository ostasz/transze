import React from 'react';

interface FuturesTickerMobileLandscapeProps {
    data: any[];
}

export default function FuturesTickerMobileLandscape({ data }: FuturesTickerMobileLandscapeProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 pb-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider px-1">Tablica Notowań</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.map((row, index) => (
                    <div key={`${row.contract}-${index}`} className="bg-[#1F2937] border border-gray-800 rounded-lg p-3 shadow-sm flex flex-col gap-1.5 active:bg-gray-800 transition-colors">
                        {/* Line 1: Contracts + Price */}
                        <div className="flex justify-between items-center bg-gray-900/50 p-1.5 -mx-1.5 -mt-1.5 rounded-t-lg mb-0.5">
                            <span className="text-white font-bold text-sm">{row.contract}</span>
                            <span className="text-[#009D8F] font-mono font-bold text-sm bg-[#009D8F]/10 px-1.5 py-0.5 rounded">
                                {row.price.toFixed(2)}
                            </span>
                        </div>

                        {/* Line 2: Details */}
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                            <div className="flex gap-2">
                                <span>Min: <span className="text-gray-300">{row.min?.toFixed(2) || '-'}</span></span>
                                <span>Max: <span className="text-gray-300">{row.max?.toFixed(2) || '-'}</span></span>
                            </div>
                            <div className="flex items-center gap-1 group">
                                <span>Vol:</span>
                                <span className="text-purple-400 font-mono group-hover:text-purple-300">
                                    {row.volume > 0 ? row.volume.toLocaleString() : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
