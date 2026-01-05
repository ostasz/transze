"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Zap, Clock } from "lucide-react";
import { format, addMonths } from "date-fns";

interface KpiData {
    label: string;
    value: number;
    unit: string;
    deltaPercent: number;
    deltaAbsolute: number;
}

export function KpiSnapshotRow() {
    const [kpis, setKpis] = useState<KpiData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch RDN History (Last 7 days to be safe, we need last 2 trade days)
                const rdnRes = await fetch('/api/energy-prices/history?days=7');
                const rdnJson = await rdnRes.json();
                const rdnHistory = rdnJson.fullHourlyHistory || [];

                // Helper to calc single day VWAP
                const calcVwap = (entry: any, startHour = 0, endHour = 23) => {
                    if (!entry || !entry.prices || entry.prices.length === 0) return 0;
                    let sumPv = 0;
                    let sumV = 0;
                    entry.prices.forEach((p: number, i: number) => {
                        // Standard Peak: 07:00 - 22:00 (Hours 8 to 22. Indices 7 to 21)
                        if (i >= startHour && i <= endHour) {
                            const vol = entry.volumes ? entry.volumes[i] : 0;
                            sumPv += p * vol;
                            sumV += vol;
                        }
                    });
                    return sumV > 0 ? sumPv / sumV : 0;
                };

                // Find latest RDN entry (Delivery Date = Quote + 1, so locally we might see 'today' as delivery)
                // The API returns distinct dates. Sort desc.
                const sortedRdn = [...rdnHistory].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const latestRdn = sortedRdn[0]; // e.g., Delivery Tomorrow/Today
                const prevRdn = sortedRdn[1];

                const rdnBase = calcVwap(latestRdn, 0, 23);
                const rdnBasePrev = calcVwap(prevRdn, 0, 23);

                const rdnPeak = calcVwap(latestRdn, 7, 21); // Hours 08:00 - 22:00
                const rdnPeakPrev = calcVwap(prevRdn, 7, 21);

                // 2. Fetch Futures (Front Month)
                // Dynamic front month: e.g. if today is Jan 5, Front is Feb.
                const today = new Date();
                const nextMonth = addMonths(today, 1);
                // The DB logic usually uses BASE_M-MM-YY.
                // Let's HARDCODE to match the likely DB seed data for now or try to be generic. 
                // User's mock data used 'BASE_M-02-25'.
                // Let's use `BASE_Y - 26` as the anchor since we know it exists.
                // And simple `BASE_M-02 - 26` if available.

                // Let's fetch Ticker from `/ api / energy - prices / futures / details` (gives everything for latest date).
                const tickerRes = await fetch('/api/energy-prices/futures/details?contract=BASE_Y-26');
                const tickerJson = await tickerRes.json();
                const ticker = tickerJson.ticker || [];

                // If we are in 2026-01-05.
                // Front Month: BASE_M-02-26.
                // Front Quarter: BASE_Q-02-26.
                // Year: BASE_Y-27 (Future) or BASE_Y-26 (Spot/Prompt)? usually Y+1.

                // Since I can't be 100% sure of exact contract names in user DB, I will pick available ones from ticker:
                // Find first "M-" contract for Base and Gas.
                const baseFront = ticker.find((t: any) => t.contract.includes("BASE_M-")) || ticker.find((t: any) => t.contract.includes("BASE_Y-"));

                // Gas is tricky, usually GAS_Base_... or similar.
                // Let's try to fetch a GAS contract details to get the GAS ticker.
                // Optimization: The previous ticker call was only for BASE family (details endpoint scopes to contract prefix).
                // We need separate calls or a better "market overview" endpoint.

                const gasRes = await fetch('/api/energy-prices/futures/details?contract=GAS_Y-26');
                const gasJson = await gasRes.json();
                const gasTicker = gasJson.ticker || [];
                const gasFront = gasTicker.find((t: any) => t.contract.includes("GAS_M-")) || gasTicker.find((t: any) => t.contract.includes("GAS_Y-"));

                const co2Res = await fetch('/api/energy-prices/futures/details?contract=CO2-DEC-26');
                const co2Json = await co2Res.json();
                const co2Ticker = co2Json.ticker || [];
                const co2Front = co2Ticker[0];

                // Helper to calculate absolute delta from price and percentage change
                const calculateAbsoluteDelta = (currentPrice: number, percentChange: number) => {
                    if (percentChange === 0) return 0;
                    const previousPrice = currentPrice / (1 + percentChange / 100);
                    return currentPrice - previousPrice;
                };

                // Build KPI List
                const newKpis: KpiData[] = [
                    {
                        label: "RDN BASE",
                        value: rdnBase,
                        unit: "PLN/MWh",
                        deltaPercent: rdnBasePrev ? ((rdnBase - rdnBasePrev) / rdnBasePrev) * 100 : 0,
                        deltaAbsolute: rdnBase - rdnBasePrev
                    },
                    {
                        label: "RDN PEAK",
                        value: rdnPeak,
                        unit: "PLN/MWh",
                        deltaPercent: rdnPeakPrev ? ((rdnPeak - rdnPeakPrev) / rdnPeakPrev) * 100 : 0,
                        deltaAbsolute: rdnPeak - rdnPeakPrev
                    },
                    {
                        label: baseFront?.contract || "BASE",
                        value: baseFront?.price || 0,
                        unit: "PLN/MWh",
                        deltaPercent: baseFront?.change || 0,
                        deltaAbsolute: calculateAbsoluteDelta(baseFront?.price || 0, baseFront?.change || 0)
                    },
                    {
                        label: gasFront?.contract || "GAS",
                        value: gasFront?.price || 0,
                        unit: "PLN/MWh",
                        deltaPercent: gasFront?.change || 0,
                        deltaAbsolute: calculateAbsoluteDelta(gasFront?.price || 0, gasFront?.change || 0)
                    },
                    {
                        label: "CO2 EUA",
                        value: co2Front?.price || 0,
                        unit: "EUR/t",
                        deltaPercent: co2Front?.change || 0,
                        deltaAbsolute: calculateAbsoluteDelta(co2Front?.price || 0, co2Front?.change || 0)
                    }
                ];

                setKpis(newKpis);
                setLastUpdated(format(new Date(), "yyyy-MM-dd HH:mm"));

            } catch (err) {
                console.error("Failed to fetch live KPIs", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="w-full text-center text-xs text-muted-foreground p-4">Ładowanie danych rynkowych...</div>;

    // Compact Ticker Card
    const tickerContent = (
        <>
            {kpis.map((kpi, idx) => (
                <div
                    key={`kpi-${idx}`}
                    className="shrink-0 relative overflow-hidden rounded-full border bg-background/95 backdrop-blur-sm px-4 py-1.5 shadow-sm flex items-center gap-3 group hover:border-primary/50 transition-colors cursor-default"
                >
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tabular-nums">{kpi.value.toFixed(2)}</span>

                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${kpi.deltaPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {kpi.deltaPercent >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            <span>{Math.abs(kpi.deltaPercent).toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );

    // Duplicate content enough times to ensure smooth scrolling even on wide screens
    // Loop 4 times to be safe
    const loopedContent = (
        <>
            {tickerContent}
            {tickerContent}
            {tickerContent}
            {tickerContent}
        </>
    );

    return (
        <div className="w-full space-y-2 select-none">
            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-25%); } 
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                    will-change: transform;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* If we render 4 blocks, moving by 1 block is 25%. Resetting at -25% snaps back to 0. Correct. */}

            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium text-foreground/80">Rynek w pigułce</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Aktualizacja: {lastUpdated}</span>
                </div>
            </div>

            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
                <div className="flex w-max gap-3 animate-marquee py-1">
                    {loopedContent}
                </div>
            </div>
        </div>
    );
}
