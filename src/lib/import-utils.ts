import { NextRequest, NextResponse } from "next/server";
// import { adminDb } from "@/lib/firebase-admin"; // Removed to prevent build-time init side effects
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

    const clean = dateStr.trim();

    // Handle YYYY-MM-DD (ISO)
    // Matches 2024-03-15
    const isoMatch = clean.match(/^(\d{4})-\d{2}-\d{2}/);
    if (isoMatch) return isoMatch[0];

    // Handle DD.MM.YYYY (Polish)
    // Matches 15.03.2024
    if (clean.includes(".")) {
        const parts = clean.split(".");
        if (parts.length === 3) {
            // Check if part 2 contains time info (e.g. 2024 12:00:00)
            const year = parts[2].split(" ")[0];
            return `${year}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
    }

    // Handle M/D/YYYY or DD/MM/YYYY with optional time
    // Matches: 1/2/2024 or 1/2/2024 12:00:00 AM
    // Regex capture: Group 1, Group 2, Group 3
    const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
        // LOGS REVEALED: "1/15/2024" -> "2024-15-01" (Invalid)
        // This proves the format is MM/DD/YYYY (US style), NOT DD/MM/YYYY.
        // slashMatch[1] = MM, slashMatch[2] = DD, slashMatch[3] = YYYY
        return `${slashMatch[3]}-${slashMatch[1].padStart(2, "0")}-${slashMatch[2].padStart(2, "0")}`;
    }

    // Handle the previously identified garbage format (just in case legacy data persists)
    // "2024 12:00:00 AM-03-\n4"
    if (clean.includes("AM") || clean.includes("PM")) {
        const match = clean.match(/^(\d{4})[\s\S]*?-(\d{2})[\s\S]*?-(\d{1,2})$/); // Compatible with older ES targets
        if (match) {
            const year = match[1];
            const day = match[2];
            const month = match[3].padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
    }

    // Fallback: standard Date parse (stripping time)
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
    }

    return clean;
}
