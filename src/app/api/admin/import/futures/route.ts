import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeDate } from "@/lib/import-utils";

export async function POST(req: NextRequest) {
    try {
        const { data } = await req.json();

        if (!data || !Array.isArray(data)) {
            return NextResponse.json(
                { error: "Invalid data format. Expected array of records." },
                { status: 400 }
            );
        }

        let count = 0;

        const validRecords = data
            .filter((r: any) => r.date && r.contract && r.DKR !== undefined)
            .map((r: any) => ({
                date: normalizeDate(r.date),
                contract: r.contract,
                price: Number(r.DKR), // Map DKR -> price
                maxPrice: r.maxPrice ? Number(r.maxPrice) : null,
                minPrice: r.minPrice ? Number(r.minPrice) : null,
                volume: Number(r.volume || 0),
                openInterest: Number(r.openInterest || 0),
            }));

        if (validRecords.length > 0) {
            const result = await prisma.futuresQuote.createMany({
                data: validRecords,
                skipDuplicates: true,
            });
            count = result.count;
        }

        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error("Futures Import Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
