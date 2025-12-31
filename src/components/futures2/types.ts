export interface FuturesHistoryPoint {
    date: string;           // Format ISO lub YYYY-MM-DD
    open?: number;
    high?: number;
    low?: number;
    close: number;
    volume?: number;
    openInterest?: number;
    change?: number;        // Opcjonalne
}

export interface FuturesTechnicalDto {
    rsi: number | null;
    atr: number | null;
    calendarSpread: number | null;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface FuturesKpiDto {
    basePrice: number;
    baseChangePct?: number; // Dynamicznie liczona zmiana
    peakPrice: number;
    peakChangePct?: number; // Dynamicznie liczona zmiana
    spread: number;
    spreadChange: number;
    volume: number;
    openInterest: number;
}
