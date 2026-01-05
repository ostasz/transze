
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
                            <th className="px-4 py-3 text-right">Kurs Rozl.</th>
                            <th className="px-4 py-3 text-right">Zmiana</th>
                            <th className="px-4 py-3 text-right">Kurs Min.</th>
                            <th className="px-4 py-3 text-right">Wolumen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.map((row, index) => (
                            <tr key={`${row.contract}-${index}`} className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-white">{row.contract}</td>
                                <td className="px-4 py-3 text-right font-bold text-gray-200">{row.price.toFixed(2)}</td>
                                <td className={`px-4 py-3 text-right font-medium ${row.change > 0 ? 'text-[#00C805]' : row.change < 0 ? 'text-[#FF3333]' : 'text-gray-400'}`}>
                                    {row.change > 0 ? '+' : ''}{row.change ? row.change.toFixed(2) : '0.00'}%
                                </td>
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
