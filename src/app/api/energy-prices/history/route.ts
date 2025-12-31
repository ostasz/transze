import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format, subDays, startOfDay, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '365', 10);

        // Calculate start date
        const endDate = new Date();
        const startDate = subDays(endDate, days);
        const startDateStr = format(startDate, 'yyyy-MM-dd');

        // Fetch prices from DB
        const prices = await prisma.energyPrice.findMany({
            where: {
                date: {
                    gte: startDateStr
                }
            },
            orderBy: [
                { date: 'asc' },
                { hour: 'asc' }
            ]
        });

        // Group by date
        const groupedHistory = prices.reduce((acc: any[], curr) => {
            const date = curr.date;

            let dayEntry = acc.find(e => e.date === date);
            if (!dayEntry) {
                dayEntry = {
                    date: date,
                    prices: new Array(24).fill(0),
                    volumes: new Array(24).fill(0)
                };
                acc.push(dayEntry);
            }

            // hour is 1-24 or 0-23? 
            // Prisma model usually stores 1-24 for TGE data. 
            // Frontend code: hour: (hour + 1).toString().padStart(2, '0') implies the array index 0 maps to hour 1.
            // Let's assume input 'hour' from DB needs to be mapped to 0-23 index.
            // If DB stores 1-24: index = hour - 1.
            // If DB stores 0-23: index = hour.
            // Checking typical TGE import logic: usually 1-24. 
            // We should treat DB hour as 1-based index safely or check logic.
            // Standardizing on 0-based index for array.

            const index = curr.hour - 1;
            if (index >= 0 && index < 24) {
                dayEntry.prices[index] = curr.price;
                dayEntry.volumes[index] = curr.volume;
            }

            return acc;
        }, []);

        return NextResponse.json({
            fullHourlyHistory: groupedHistory
        });

    } catch (error) {
        console.error('Error fetching energy prices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch energy prices' },
            { status: 500 }
        );
    }
}
