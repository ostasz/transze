
import React from 'react';

interface FuturesTableProps {
    data: {
        contract: string;
        price: number;
        change: number;
        volume: number;
        volumeChange: number;
        openInterest: number;
        minPrice: number;
        maxPrice: number;
    }[];
}

export default function FuturesTable({ data }: FuturesTableProps) {
    // Sort by volume desc default? Or contract name?
    // Contract name usually implies delivery date, so sorting by contract logic is best.
    // The data passed should ideally be sorted. 
    // Let's assume parent sorts it by delivery. 
    // Or we sort by contract alphabetically for now.

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900">Notowania Kontraktów</h3>
            </div>
            <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3">Kontrakt</th>
                            <th className="px-4 py-3 text-right">Kurs (PLN)</th>
                            <th className="px-4 py-3 text-right">Zmiana</th>
                            <th className="px-4 py-3 text-right">Wolumen</th>
                            <th className="px-4 py-3 text-right">LOP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((row) => (
                            <tr key={row.contract} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{row.contract}</td>
                                <td className="px-4 py-2 text-right font-mono font-semibold">{row.price.toFixed(2)}</td>
                                <td className={`px-4 py-2 text-right font-mono ${row.change > 0 ? 'text-green-600' : row.change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                    {row.change > 0 ? '+' : ''}{row.change.toFixed(2)}%
                                </td>
                                <td className="px-4 py-2 text-right text-gray-600 font-mono">
                                    {row.volume.toLocaleString('pl-PL')}
                                </td>
                                <td className="px-4 py-2 text-right text-gray-600 font-mono">
                                    {row.openInterest.toLocaleString('pl-PL')}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400">Brak notowań</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
