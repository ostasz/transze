export interface RDNRecord {
    date: string;
    hour: number;
    price: number;
    volume: number;
    id?: string;
}

export interface FuturesRecord {
    date: string;
    contract: string;
    DKR: number; // Settlement Price
    maxPrice?: number;
    minPrice?: number;
    volume?: number;
    openInterest?: number;
}
