import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

// Stooq Tickers configuration
const TICKERS = [
    { symbol: 'CK.F', contract: 'CO2-EUA-SPOT' }, // Continuous
    // 2026
    { symbol: 'CKH26.F', contract: 'CO2-EUA-MAR-26' },
    { symbol: 'CKM26.F', contract: 'CO2-EUA-JUN-26' },
    { symbol: 'CKU26.F', contract: 'CO2-EUA-SEP-26' },
    { symbol: 'CKZ26.F', contract: 'CO2-EUA-DEC-26' },
    // 2027
    { symbol: 'CKH27.F', contract: 'CO2-EUA-MAR-27' },
    { symbol: 'CKM27.F', contract: 'CO2-EUA-JUN-27' },
    { symbol: 'CKU27.F', contract: 'CO2-EUA-SEP-27' },
    { symbol: 'CKZ27.F', contract: 'CO2-EUA-DEC-27' },
];

interface StooqRecord {
    Date: string;   // YYYY-MM-DD
    Open: string;
    High: string;
    Low: string;
    Close: string;
    Volume: string;
}

// Helper to prevent rapid-fire requests (Stooq rate limit avoidance)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(req: Request) {
    try {
        const results = [];

        for (const { symbol, contract } of TICKERS) {
            // Random delay between 2s and 5s to avoid blocking
            const delay = 2000 + Math.random() * 3000;
            console.log(`Waiting ${Math.round(delay)}ms...`);
            await sleep(delay);

            // Stooq CSV URL: https://stooq.pl/q/d/l/?s=ck.f&i=d
            const url = `https://stooq.pl/q/d/l/?s=${symbol.toLowerCase()}&i=d`;

            console.log(`Fetching ${symbol}...`);
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                next: { revalidate: 0 } // No cache
            });

            if (!response.ok) {
                console.error(`Failed to fetch ${symbol}: ${response.statusText}`);
                results.push({ symbol, status: 'error', error: response.statusText });
                continue;
            }

            const csvText = await response.text();

            // Check if Stooq returned a valid CSV or an error/html page
            // Stooq often returns "Exceeded the limit" HTML page if blocked
            if (csvText.includes('Exceeded the limit') || !csvText.includes('Date,Open')) {
                console.warn(`Invalid response for ${symbol}:`, csvText.substring(0, 100));
                results.push({ symbol, status: 'skipped', reason: 'Invalid CSV or Limit' });
                continue;
            }

            const parsed = Papa.parse<StooqRecord>(csvText, {
                header: true,
                skipEmptyLines: true,
            });

            if (parsed.errors.length > 0) {
                console.error(`CSV Parse error for ${symbol}`, parsed.errors);
            }

            // Process records
            let count = 0;
            for (const row of parsed.data) {
                if (!row.Date || row.Close === 'N/A') continue;

                const date = new Date(row.Date);
                const price = parseFloat(row.Close);
                const maxPrice = parseFloat(row.High);
                const minPrice = parseFloat(row.Low);
                const volume = parseFloat(row.Volume);

                if (isNaN(price)) continue;

                await prisma.futuresQuote.upsert({
                    where: {
                        date_contract: {
                            date: date,
                            contract: contract
                        }
                    },
                    update: {
                        price,
                        maxPrice: isNaN(maxPrice) ? undefined : maxPrice,
                        minPrice: isNaN(minPrice) ? undefined : minPrice,
                        volume: isNaN(volume) ? 0 : volume,
                    },
                    create: {
                        date: date,
                        contract: contract,
                        price,
                        maxPrice: isNaN(maxPrice) ? undefined : maxPrice,
                        minPrice: isNaN(minPrice) ? undefined : minPrice,
                        volume: isNaN(volume) ? 0 : volume,
                    }
                });
                count++;
            }
            results.push({ symbol, contract, recordsProcessed: count, status: 'success' });
        }

        return NextResponse.json({
            success: true,
            summary: results
        });

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
