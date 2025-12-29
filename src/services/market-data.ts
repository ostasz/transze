import "server-only";
import { prisma } from "@/lib/prisma";
import { RDNRecord, FuturesRecord } from "@/types/market-data";

export class MarketDataService {
    /**
     * Fetches RDN (Day-Ahead Market) prices for a specific date.
     * @param date Date string in YYYY-MM-DD format
     */
    static async getRDNData(date: string): Promise<RDNRecord[]> {
        console.log(`[MarketData] Fetching RDN data (Prisma) for date: ${date}`);
        try {
            const records = await prisma.energyPrice.findMany({
                where: { date },
                orderBy: { hour: 'asc' },
            });

            return records.map(r => ({
                id: r.id,
                date: r.date,
                hour: r.hour,
                price: r.price,
                volume: r.volume
            }));
        } catch (error) {
            console.error("Error fetching RDN data:", error);
            return [];
        }
    }

    /**
     * Fetches the latest available date in the RDN table.
     */
    static async getLatestRDNDate(): Promise<string | null> {
        try {
            const latest = await prisma.energyPrice.findFirst({
                orderBy: { date: 'desc' },
                select: { date: true }
            });

            return latest?.date || null;
        } catch (error) {
            console.error("Error fetching latest RDN date:", error);
            return null;
        }
    }

    /**
     * Fetches Futures data for a specific date (all contracts).
     * @param date Date string in YYYY-MM-DD format
     */
    static async getFuturesByDate(date: string): Promise<FuturesRecord[]> {
        try {
            const records = await prisma.futuresQuote.findMany({
                where: { date },
            });

            return records.map(r => ({
                date: r.date,
                contract: r.contract,
                DKR: r.price, // Map price -> DKR
                maxPrice: r.maxPrice || 0,
                minPrice: r.minPrice || 0,
                volume: r.volume,
                openInterest: r.openInterest,
            }));
        } catch (error) {
            console.error("Error fetching futures data:", error);
            return [];
        }
    }

    /**
     * Fetches the latest Settlement Price (DKR) for a specific contract.
     * @param contract Contract name (e.g., "BASE_Y-25")
     */
    static async getLatestContractPrice(
        contract: string
    ): Promise<FuturesRecord | null> {
        try {
            const latest = await prisma.futuresQuote.findFirst({
                where: { contract },
                orderBy: { date: 'desc' },
            });

            if (!latest) return null;

            return {
                date: latest.date,
                contract: latest.contract,
                DKR: latest.price,
                maxPrice: latest.maxPrice || 0,
                minPrice: latest.minPrice || 0,
                volume: latest.volume,
                openInterest: latest.openInterest,
            };
        } catch (error) {
            console.error(`Error fetching latest price for ${contract}:`, error);
            return null;
        }
    }
}
