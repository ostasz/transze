
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Calculate years
        const currentYear = new Date().getFullYear();
        const year1 = currentYear + 1;
        const year2 = currentYear + 2;

        // TGE Contract Naming Convention: "BASE_Y-26" -> Year 2026
        // Or "BASE_Y-25" -> Year 2025
        // We need to map 2026 -> 26
        const suffix1 = (year1 % 100).toString(); // "26"
        const suffix2 = (year2 % 100).toString(); // "27"

        const contract1 = `BASE_Y-${suffix1}`;
        const contract2 = `BASE_Y-${suffix2}`;

        // Fetch all quotes for these two contracts
        // Fetch all quotes for these two contracts
        const quotes = await prisma.futuresQuote.findMany({
            where: {
                contract: {
                    in: [contract1, contract2]
                }
            },
            orderBy: { date: 'asc' }
        });

        // Group by Year String ("2026", "2027")
        // Mapping contract "BASE_Y-26" -> "2026"

        const futures: Record<string, any[]> = {
            [year1.toString()]: [],
            [year2.toString()]: []
        };

        quotes.forEach(q => {
            let yearKey = "";
            if (q.contract === contract1) yearKey = year1.toString();
            else if (q.contract === contract2) yearKey = year2.toString();

            if (yearKey) {
                // q.date is now a Date object.
                // We format it to YYYY-MM-DD or let it be ISO.
                // Frontend expects standard string parseable by new Date().
                // Let's ensure it's ISO string for safety.
                futures[yearKey].push({
                    date: q.date.toISOString().split('T')[0], // "YYYY-MM-DD"
                    price: q.price,
                    volume: q.volume
                });
            }
        });

        return NextResponse.json({ futures });

    } catch (error: any) {
        console.error("Futures API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
