
import React from 'react';

interface FuturesTickerProps {
    data: any[];
}

export default function FuturesTicker({ data }: FuturesTickerProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-[#1F2937] rounded-xl border border-gray-800 shadow-lg overflow-hidden h-[380px] flex flex-col">
            <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-bold text-lg">Tablica Notowań (Ticker Board)</h3>
            </div>
            <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-[#111827] sticky top-0">
                        <tr>
                            <th className="px-4 py-3">Instrument</th>
                            <th className="px-4 py-3 text-right">Kurs</th>
                            <th className="px-4 py-3 text-right">Min</th>
                            <th className="px-4 py-3 text-right">Wolumen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.map((row, index) => (
                            <tr key={`${row.instrument}-${index}`} className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-white">{row.instrument}</td>
                                <td className="px-4 py-3 text-right font-bold text-gray-200">{row.price.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right text-gray-500">{row.min?.toFixed(2) || '-'}</td>
                                <td className="px-4 py-3 text-right text-purple-400 font-mono">{row.volume > 0 ? row.volume.toLocaleString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
