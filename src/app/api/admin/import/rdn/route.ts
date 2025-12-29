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

        // Use createMany with skipDuplicates for high performance on Postgres
        // NOTE: This assumes 'date' + 'hour' unique constraint exists (added in schema)

        const validRecords = data
            .filter((r: any) => r.date && r.hour !== undefined && r.price !== undefined)
            .map((r: any) => ({
                date: normalizeDate(r.date),
                hour: Number(r.hour),
                price: Number(r.price),
                volume: Number(r.volume || 0),
            }));

        if (validRecords.length > 0) {
            const result = await prisma.energyPrice.createMany({
                data: validRecords,
                skipDuplicates: true,
            });
            count = result.count;
        }

        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error("RDN Import Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
