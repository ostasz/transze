import React from 'react';
import Link from 'next/link';

export default function FuturesLandscapeToolbarCompact() {
    return (
        <div className="flex items-center justify-between h-12 px-4 bg-[#1F2937] border-b border-gray-800 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="bg-blue-500/10 p-1 rounded text-blue-500">
                    <span className="text-lg">⚡</span>
                </div>
                <span className="font-bold text-white tracking-tight">Futures PRO</span>
            </div>

            <div className="bg-gray-900 p-0.5 rounded-lg flex items-center border border-gray-700">
                <Link href="/futures" className="px-2 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-white transition-colors">
                    Simple
                </Link>
                <span className="px-2 py-1 rounded-md text-xs font-bold bg-[#009D8F] text-white shadow-sm cursor-default">
                    Pro
                </span>
            </div>
        </div>
    );
}
