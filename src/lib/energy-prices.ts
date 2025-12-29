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
                        let dateStr = row.tge_rdn_kontrakty_DataNotowania;

                        // Handle MM/DD/YYYY format from CSV
                        // Try to extract date part
                        const dateMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                        if (dateMatch) {
                            // MM/DD/YYYY -> YYYY-MM-DD
                            const [_, month, day, year] = dateMatch;
                            dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        } else {
                            dateStr = normalizeDate(dateStr);
                        }

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

export async function processFuturesData(csvContent: string) {
    return new Promise<{ processed: number; errors: number, details?: string }>(async (resolve, reject) => {
        Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const data = results.data as any[];
                    const validRecords: any[] = [];

                    for (const row of data) {
                        // Fuzzy key matching specific to this row
                        const findVal = (keys: string[]) => {
                            const rowKeys = Object.keys(row);
                            const match = rowKeys.find(k => keys.some(target => k.toLowerCase().includes(target.toLowerCase())));
                            return match ? row[match] : undefined;
                        };

                        // 1. Identify DATE
                        const dateStrRaw = findVal(['data', 'date', 'notowania']);
                        // 2. Identify CONTRACT
                        const contract = findVal(['kontrakt', 'contract', 'instrument']);
                        // 3. Identify PRICE (Settlement / Rozliczeniowy)
                        const priceRaw = findVal(['kurs roz', 'rozliczeniowy', 'settlement', 'price']);

                        if (!dateStrRaw || !contract || !priceRaw) {
                            continue;
                        }

                        // Normalization
                        let dateStr = normalizeDate(dateStrRaw);
                        const price = parsePolishNumber(priceRaw);
                        const volume = parsePolishNumber(findVal(['wolumen', 'volume']) || "0");
                        const openInterest = parsePolishNumber(findVal(['lop', 'open interest', 'liczba otw']) || "0");
                        const minPrice = parsePolishNumber(findVal(['kurs min', 'min']) || "0");
                        const maxPrice = parsePolishNumber(findVal(['kurs max', 'max']) || "0");

                        validRecords.push({
                            date: dateStr,
                            contract: contract,
                            price: price,
                            volume: volume,
                            openInterest: openInterest,
                            minPrice: minPrice,
                            maxPrice: maxPrice
                        });
                    }

                    if (validRecords.length > 0) {
                        console.log(`[Import] Found ${validRecords.length} valid Futures records. Saving to Neon...`);

                        await prisma.futuresQuote.createMany({
                            data: validRecords,
                            skipDuplicates: true,
                        });
                    } else {
                        console.log("[Import] No valid Futures records found in CSV.");
                    }

                    resolve({ processed: validRecords.length, errors: results.errors.length, details: `Found ${validRecords.length} futures records` });
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
