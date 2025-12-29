'use client';

import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Rdn2TableProps {
    data: any[];
}

export default function Rdn2Table({ data }: Rdn2TableProps) {
    if (!data) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Tabela godzinowa</h2>
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Godz.</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Cena (PLN)</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Zmiana</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Wolumen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-3 py-1 font-mono text-xs text-gray-500">{row.hour}</td>
                                <td className="px-3 py-1 text-right font-mono text-xs font-medium text-gray-900">
                                    {row.price.toFixed(2)}
                                </td>
                                <td className="px-3 py-1 text-right">
                                    {row.change !== 0 && (
                                        <span className={cn(
                                            "inline-flex items-center gap-0.5 text-[10px] font-medium rounded-full px-1.5 py-0.5",
                                            row.change > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                        )}>
                                            {row.change > 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                                            {Math.abs(row.change).toFixed(2)}%
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 py-1 text-right font-mono text-xs text-gray-600">
                                    {Math.round(row.volume).toLocaleString('pl-PL')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
