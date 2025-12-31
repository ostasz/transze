import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeDate } from "@/lib/import-utils";
import { auth } from "@/lib/auth"; // Auth v5

const BATCH_SIZE = 1000;

export async function POST(req: NextRequest) {
    try {
        // 1. Security Check
        const session = await auth();
        // Assuming role is on user object as extended in auth.ts
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data } = await req.json();

        if (!data || !Array.isArray(data)) {
            return NextResponse.json(
                { error: "Invalid data format. Expected array of records." },
                { status: 400 }
            );
        }

        let count = 0;
        let skipped = 0;

        // 2. Prepare Data (Validation & Type Conversion)
        const validRecords = [];

        for (const r of data) {
            if (!r.date || !r.contract || r.DKR === undefined) continue;

            // Normalize & strictly parse date
            const dateStr = normalizeDate(r.date);
            const dateObj = new Date(dateStr);

            if (isNaN(dateObj.getTime())) {
                skipped++;
                continue;
            }

            validRecords.push({
                date: dateObj, // DateTime
                contract: r.contract.trim().toUpperCase(), // Canonical
                price: Number(r.DKR),
                maxPrice: r.maxPrice ? Number(r.maxPrice) : null,
                minPrice: r.minPrice ? Number(r.minPrice) : null,
                volume: Number(r.volume || 0),
                openInterest: Number(r.openInterest || 0),
            });
        }

        if (validRecords.length > 0) {
            // 3. Batched Insert
            for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
                const batch = validRecords.slice(i, i + BATCH_SIZE);
                const result = await prisma.futuresQuote.createMany({
                    data: batch,
                    skipDuplicates: true,
                });
                count += result.count;
            }
        }

        return NextResponse.json({
            success: true,
            count,
            skipped,
            message: `Imported ${count} records. Skipped ${skipped} valid records.`
        });
    } catch (error) {
        console.error("Futures Import Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
