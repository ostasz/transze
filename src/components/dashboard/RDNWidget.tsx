"use client";

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";

export default function RDNWidget() {
    // Mock data based on screenshot
    const price = 520.72;
    const change = -82.29;
    const changePercent = -13.6;
    const date = "6 gru";

    const isPositive = change > 0;

    return (
        <a href="#" className="block group">
            <div className="relative overflow-hidden rounded-2xl bg-[#0f111a] p-6 shadow-lg border border-gray-800 hover:border-gray-700 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#1a1d2d]">
                            <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">TGe24 (RDN)</h3>
                            <p className="text-xs text-gray-400">Rynek Dnia Następnego (PLN/MWh)</p>
                        </div>
                    </div>
                    <div className="text-gray-500 group-hover:text-white transition-colors">
                        ↗
                    </div>
                </div>

                <div className="mt-8">
                    <p className="text-sm text-gray-400 mb-1">Index TGe24</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{price.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">PLN</span>
                    </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isPositive ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                        {Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(1)}%)
                    </div>
                    <span className="text-xs text-gray-500">{date}</span>
                </div>

                {/* Decorative Sparkline (Optional/Mock) */}
                <div className="absolute right-0 bottom-6 w-32 h-16 opacity-50">
                    <svg viewBox="0 0 100 40" className="w-full h-full stroke-red-500 fill-none stroke-2">
                        <path d="M0 30 C 20 20, 40 35, 60 15 S 80 25, 100 5" />
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                    </svg>
                </div>
            </div>
        </a>
    );
}
