
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        const contract = searchParams.get('contract');
        const days = parseInt(searchParams.get('days') || '365');

        // 1. Snapshot mode (Specific Date)
        if (date) {
            // "date" in db is String YYYY-MM-DD
            // If user provides just YYYY-MM-DD, strict match.
            // If user provides ISO, we might need substring. 
            // Assuming simplified usage: date=YYYY-MM-DD
            const quotes = await prisma.futuresQuote.findMany({
                where: {
                    date: date
                },
                orderBy: {
                    contract: 'asc'
                }
            });

            // Also fetch previous day for change calculation?
            // "Previous day" logic for Strings is tricky without parsing.
            // But we can fetch ALL dates and filter in memory if volume isn't huge.
            // Or assume client handles complex diffs or we do a second query.
            // Let's keep it simple: return just the snapshot.
            // Actually, for KPI "Change", we need previous data.
            // Let's fetch last 2 days if date is provided?
            // No, finding "previous business day" is hard in code without a calendar.
            // Better to fetch a window (e.g. 7 days ending on date) for the specific contracts?
            // "Snapshot" usually implies data for that day.
            // Client dashboard logic (like RDN) fetches a big history and calculates diffs.
            // So default behavior should probably be "fetch history" and let client slice it.

            return NextResponse.json({ snapshot: quotes });
        }

        // 2. History mode (Specific Contract)
        if (contract) {
            const quotes = await prisma.futuresQuote.findMany({
                where: {
                    contract: contract
                },
                orderBy: {
                    date: 'asc'
                },
                take: days // Limit history depth
            });
            return NextResponse.json({ history: quotes });
        }

        // 3. Global History (All data for last N days)
        // This is what RDN dashboard does (fetches 365 days of everything).
        // Futures data is much larger (many contracts per day).
        // RDN: 24 rows per day. Futures: ~20-50 contracts per day?
        // 365 * 50 = 18,000 rows. JSON size might be 2-3MB. Acceptable for MVP.

        // We need to order by date asc, then contract asc
        // But Prisma 'take' works on rows.
        // We want "all contracts for the last N distinct dates".

        // Step 1: Find the latest dates
        const distinctDates = await prisma.futuresQuote.findMany({
            select: { date: true },
            distinct: ['date'],
            orderBy: { date: 'desc' },
            take: days
        });

        if (distinctDates.length === 0) {
            return NextResponse.json({ fullHistory: [] });
        }

        const dates = distinctDates.map(d => d.date);

        // Step 2: Fetch all quotes for these dates
        const quotes = await prisma.futuresQuote.findMany({
            where: {
                date: {
                    in: dates
                }
            },
            orderBy: [
                { date: 'asc' },
                { contract: 'asc' }
            ]
        });

        // Group by Date for easier frontend consumption?
        // RDN returned `fullHourlyHistory`.
        // Futures structure: [{date: '...', contracts: [{name: 'BASE...', price: 100}, ...]}]

        const groupedHistory = dates.sort().map(d => {
            const dayQuotes = quotes.filter(q => q.date === d);
            // Calculate aggregations if needed, or just return raw list
            const totalVolume = dayQuotes.reduce((sum, q) => sum + (q.volume || 0), 0);
            const totalOpenInterest = dayQuotes.reduce((sum, q) => sum + (q.openInterest || 0), 0);

            return {
                date: d,
                quotes: dayQuotes,
                stats: {
                    totalVolume,
                    totalOpenInterest
                }
            };
        });

        return NextResponse.json({ fullHistory: groupedHistory });

    } catch (error: any) {
        console.error("Futures API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
