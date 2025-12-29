"use client";

import { BoltIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";

export default function FuturesWidget() {
    return (
        <a href="#" className="block group h-full">
            <div className="relative overflow-hidden rounded-2xl bg-[#0f111a] p-6 shadow-lg border border-gray-800 hover:border-gray-700 transition-all h-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#1a1d2d]">
                            <BoltIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Notowania Terminowe (Futures)</h3>
                            <p className="text-xs text-gray-400">Kontrakty BASE (PLN/MWh)</p>
                        </div>
                    </div>
                    <div className="text-gray-500 group-hover:text-white transition-colors">
                        ↗
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* 2026 */}
                    <div>
                        <p className="text-xs text-gray-400 mb-1">BASE 2026</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">452.20</span>
                            <span className="text-xs text-gray-500">PLN</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">
                                <ArrowTrendingUpIcon className="w-3 h-3" />
                                3.68 (0.8%)
                            </div>
                            <span className="text-[10px] text-gray-500">5 gru</span>
                        </div>
                    </div>

                    {/* 2027 */}
                    <div>
                        <p className="text-xs text-gray-400 mb-1">BASE 2027</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">443.00</span>
                            <span className="text-xs text-gray-500">PLN</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                                - 0.00 (0.0%)
                            </div>
                            <span className="text-[10px] text-gray-500">5 gru</span>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}
