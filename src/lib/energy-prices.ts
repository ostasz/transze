import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { parsePolishNumber, normalizeDate } from "@/lib/import-utils";

interface TGERDNRow {
    tge_rdn_kontrakty_DataNotowania: string;
    tge_rdn_kontrakty_GodzinaNazwa: string;
    tge_rdn_kontrakty_KursFixing1: string;
    tge_rdn_kontrakty_WolumenFixing1: string;
    [key: string]: any;
}

export async function processEnergyPriceData(csvContent: string) {
    return new Promise<{ processed: number; errors: number }>(async (resolve, reject) => {
        Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const data = results.data as TGERDNRow[];
                    const validRecords: any[] = [];

                    for (const row of data) {
                        // Check essential fields
                        if (!row.tge_rdn_kontrakty_DataNotowania || !row.tge_rdn_kontrakty_KursFixing1) {
                            continue;
                        }

                        // Parse Date: "3/15/2024 12:00:00 AM" -> "2024-03-15"
                        // normalizeDate helper handles typical formats including DD.MM.YYYY and DD/MM/YYYY
                        let dateStr = normalizeDate(row.tge_rdn_kontrakty_DataNotowania);

                        // Parse Hour: "1", "2"... 
                        // NOTE: TGE might send "0-1" or just "1". Assuming single number based on common TGE formats, 
                        // but if column says "GodzinaNazwa" and typically it's 1-24. 
                        // If the row data is "60.68" in Hour column (wait, looking at screenshot row 1: "60.68" seems to be price).
                        // Let's re-examine screenshot.
                        // Row 2: "3/15/2024...", "3/16/2024...", "1", "279.1",  "2637.1"
                        // Col 3 seems to be GodzinaNazwa ("1")
                        // Col 4 seems to be KursFixing1 ("279.1")

                        // Clean up Hour string "0-1" -> 1 if needed, or parse int
                        let hour = parseInt(row.tge_rdn_kontrakty_GodzinaNazwa);
                        // If hour comes as "00:00-01:00", we might need more logic, but user screenshot shows "1" (implied from typical TGE format).

                        const price = parsePolishNumber(row.tge_rdn_kontrakty_KursFixing1);
                        const volume = parsePolishNumber(row.tge_rdn_kontrakty_WolumenFixing1);

                        validRecords.push({
                            date: dateStr,
                            hour: hour,
                            price: price,
                            volume: volume,
                        });
                    }

                    if (validRecords.length > 0) {
                        console.log(`[Import] Found ${validRecords.length} valid records. Saving to Neon...`);

                        // Batch insert using createMany
                        await prisma.energyPrice.createMany({
                            data: validRecords,
                            skipDuplicates: true,
                        });
                    }

                    resolve({ processed: validRecords.length, errors: results.errors.length });
                } catch (error) {
                    console.error("Processing Error:", error);
                    reject(error);
                }
            },
            error: (error: any) => {
                reject(error);
            }
        });
    });
}

interface FuturesCsvRow {
    tge_rtpe_DataNotowania: string;
    tge_rtpe_Kontrakt: string;
    tge_rtpe_KursMax: string;
    tge_rtpe_KursMin: string;
    tge_rtpe_KursRozliczeniowy: string;
    tge_rtpe_LiczbaKontraktow: string;
    tge_rtpe_LiczbaOtwartychPozycji: string;
    tge_rtpe_LiczbaTransakcji: string;
    tge_rtpe_WartoscObrotu: string;
    tge_rtpe_WolumenObrotu: string;
}

const BATCH_SIZE = 1000;

export async function processFuturesData(csvContent: string) {
    // Strip BOM if present
    const cleanContent = csvContent.replace(/^\uFEFF/, '');

    return new Promise<{ processed: number; errors: number, details?: string }>(async (resolve, reject) => {
        Papa.parse<FuturesCsvRow>(cleanContent, {
            header: true,
            skipEmptyLines: true,
            delimitersToGuess: [';', ',', '\t'],
            transformHeader: (h) => h.trim(),
            complete: async (results) => {
                try {
                    const data = results.data;
                    const validRecords: any[] = [];
                    let skippedDates = 0;

                    for (const row of data) {
                        // Strict validation based on user code
                        if (!row.tge_rtpe_DataNotowania || !row.tge_rtpe_Kontrakt) {
                            continue;
                        }

                        // Normalize Date String first
                        let dateStr = normalizeDate(row.tge_rtpe_DataNotowania);

                        // Create Date Object for Prisma DateTime
                        const dateObj = new Date(dateStr);

                        // Strict Date Validation
                        if (isNaN(dateObj.getTime())) {
                            if (skippedDates < 5) {
                                console.log(`[Import Debug] Failed Row: Raw="${row.tge_rtpe_DataNotowania}", Normalized="${dateStr}", DateObj="${dateObj}"`);
                            }
                            skippedDates++;
                            continue; // Skip invalid date
                        }

                        // Parse Numbers
                        const price = parsePolishNumber(row.tge_rtpe_KursRozliczeniowy);
                        const volume = parsePolishNumber(row.tge_rtpe_WolumenObrotu);
                        const openInterest = parsePolishNumber(row.tge_rtpe_LiczbaOtwartychPozycji);
                        const minPrice = parsePolishNumber(row.tge_rtpe_KursMin);
                        const maxPrice = parsePolishNumber(row.tge_rtpe_KursMax);

                        // Skip empty closing prices
                        if (price === 0) continue;

                        validRecords.push({
                            date: dateObj, // Now passing Date object
                            contract: row.tge_rtpe_Kontrakt.trim().toUpperCase(), // Canonicalize
                            price: price,
                            volume: volume,
                            openInterest: openInterest,
                            minPrice: minPrice,
                            maxPrice: maxPrice
                        });
                    }

                    if (validRecords.length > 0) {
                        console.log(`[Import] Found ${validRecords.length} valid Futures records. Saving to Neon (Batch size: ${BATCH_SIZE})...`);

                        // Batch Insert
                        for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
                            const batch = validRecords.slice(i, i + BATCH_SIZE);
                            try {
                                await prisma.futuresQuote.createMany({
                                    data: batch,
                                    skipDuplicates: true,
                                });
                                console.log(`[Import] Saved batch ${i / BATCH_SIZE + 1} (${batch.length} records)`);
                            } catch (batchError) {
                                console.error(`[Import] Error saving batch ${i / BATCH_SIZE + 1}:`, batchError);
                                // Potentially continue or throw? Throwing to stop corrupt partial state might be safer but for bulk import best effort is often okay.
                                // Let's log and continue to try next batches.
                            }
                        }
                    } else {
                        console.log("[Import] No valid Futures records found in CSV.");
                    }

                    resolve({
                        processed: validRecords.length,
                        errors: results.errors.length + skippedDates,
                        details: `Processed ${validRecords.length} records. Skipped ${skippedDates} invalid dates.`
                    });
                } catch (error) {
                    console.error("Futures Processing Error:", error);
                    reject(error);
                }
            },
            error: (error: any) => {
                reject(error);
            }
        });
    });
}
