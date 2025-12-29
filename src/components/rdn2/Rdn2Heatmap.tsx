'use client';

import { cn } from '@/lib/utils';

interface Rdn2HeatmapProps {
    data: {
        days: string[];
        hours: number[];
        values: number[][]; // [hourIndex][dayIndex]
    };
}

export default function Rdn2Heatmap({ data }: Rdn2HeatmapProps) {
    if (!data || !data.values || data.values.length === 0) return null;

    // Determine Min/Max for color scaling
    const flatValues = data.values.flat();
    const minVal = Math.min(...flatValues);
    const maxVal = Math.max(...flatValues);

    const getColor = (val: number) => {
        // Simple 3-stop gradient interpolation: Mint (#009D8F) -> Lime (#D2E603) -> Orange (#F97316)
        // Normalize 0-1
        const t = (val - minVal) / (maxVal - minVal || 1);

        // Helper to mix colors
        const mix = (c1: number[], c2: number[], w: number) => c1.map((c, i) => Math.round(c + w * (c2[i] - c)));
        const toHex = (rgb: number[]) => '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');

        const mint = [0, 157, 143]; // #009D8F
        const lime = [210, 230, 3]; // #D2E603
        const orange = [249, 115, 22]; // #F97316

        let rgb;
        if (t < 0.5) {
            rgb = mix(mint, lime, t * 2);
        } else {
            rgb = mix(lime, orange, (t - 0.5) * 2);
        }
        return toHex(rgb);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Mapa ciepła (14 dni)</h2>
                    <p className="text-xs text-gray-500">Rozkład cen w godzinach</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Niska</span>
                    <div className="w-24 h-2 rounded-full bg-gradient-to-r from-[#009D8F] via-[#D2E603] to-[#F97316]" />
                    <span>Wysoka</span>
                </div>
            </div>

            <div className="flex-1 flex justify-center overflow-x-auto">
                <div className="grid grid-cols-[auto_repeat(14,_minmax(0,_1fr))] gap-1">
                    {/* Header Row (Days) */}
                    <div className="h-6 w-8" /> {/* Corner spacer */}
                    {data.days.map((day, i) => (
                        <div key={i} className="text-[10px] text-gray-400 font-medium text-center">{day}</div>
                    ))}

                    {/* Rows (Hours) */}
                    {data.hours.map((hour, hIdx) => (
                        <>
                            {/* Hour Label */}
                            <div key={`h-${hIdx}`} className="text-[10px] text-gray-400 font-mono text-right pr-2 pt-1 h-6">
                                {hour.toString().padStart(2, '0')}
                            </div>

                            {/* Cells */}
                            {data.days.map((_, dIdx) => {
                                const val = data.values[hIdx][dIdx];
                                return (
                                    <div
                                        key={`${hIdx}-${dIdx}`}
                                        className="h-6 w-full rounded-sm hover:scale-110 transition-transform cursor-default group relative"
                                        style={{ backgroundColor: getColor(val) }}
                                    >
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 shadow-xl">
                                            {val.toFixed(2)} PLN
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
}
