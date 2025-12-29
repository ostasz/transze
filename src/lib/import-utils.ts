import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { RDNRecord, FuturesRecord } from "@/types/market-data";

/**
 * Shared helper to parse Polish numbers (e.g. "1 234,56" -> 1234.56)
 */
export function parsePolishNumber(value: string | number | undefined): number {
    if (typeof value === "number") return value;
    if (!value) return 0;

    // Remove spaces (thousands separators) and replace comma with dot
    const normalized = value.toString().replace(/\s/g, "").replace(",", ".");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Shared helper to standardize dates to YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string {
    if (!dateStr) return "";

    // Handle YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;

    // Handle DD.MM.YYYY
    if (dateStr.includes(".")) {
        const parts = dateStr.split(".");
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
    }

    return dateStr;
}
