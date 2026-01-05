
import { addDays, subDays, format } from 'date-fns';

export interface MarketKpi {
    label: string;
    value: number;
    unit: string;
    deltaPercent: number;
    deltaAbsolute: number;
    timestamp: string;
}

export interface RdnDataPoint {
    hour: number;
    price: number;
    volume?: number;
}

export interface RdnSnapshot {
    date: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    totalVolume: number;
    hourly: RdnDataPoint[];
}

export interface FuturesContract {
    id: string;
    name: string; // e.g., "BASE_M-02-24"
    group: 'Energia' | 'Gaz' | 'CO2';
    period: 'M' | 'Q' | 'Y';
    deliveryDate: string;
    price: number;
    changePercent: number;
    volume: number;
    openInterest?: number;
}

export interface NewsItem {
    id: string;
    title: string;
    source: string;
    category: 'TGE' | 'URE' | 'PSE' | 'EU' | 'Gaz' | 'CO2' | 'Regulacje' | 'Inne' | 'Ekovoltis';
    timestamp: string;
    isImportant: boolean;
    summary?: string;
    url: string;
}

// MOCK DATA GENERATORS

const generateRdnProfile = (): RdnDataPoint[] => {
    return Array.from({ length: 24 }, (_, i) => {
        const hour = i + 1;
        // Simple "duck curve" or typical daily profile simulation
        let base = 450;
        if (hour >= 7 && hour <= 22) base += 150; // Daytime peak
        if (hour >= 18 && hour <= 21) base += 100; // Evening peak
        const random = Math.random() * 40 - 20;
        return {
            hour,
            price: Math.round(base + random),
            volume: Math.round(1500 + Math.random() * 1000)
        };
    });
};

export const MOCK_KPI_DATA: MarketKpi[] = [
    { label: "RDN BASE", value: 585.42, unit: "PLN/MWh", deltaPercent: 12.5, deltaAbsolute: 65.20, timestamp: new Date().toISOString() },
    { label: "RDN PEAK", value: 698.10, unit: "PLN/MWh", deltaPercent: 8.2, deltaAbsolute: 52.80, timestamp: new Date().toISOString() },
    { label: "BASE_M-02-25", value: 495.00, unit: "PLN/MWh", deltaPercent: -1.2, deltaAbsolute: -6.00, timestamp: new Date().toISOString() },
    { label: "GAS_M-02-25", value: 185.50, unit: "PLN/MWh", deltaPercent: 2.1, deltaAbsolute: 3.80, timestamp: new Date().toISOString() },
    { label: "CO2 EUA", value: 68.20, unit: "EUR/t", deltaPercent: 0.5, deltaAbsolute: 0.35, timestamp: new Date().toISOString() },
];

export const MOCK_RDN_SNAPSHOT: RdnSnapshot = {
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // Delivery D+1
    avgPrice: 585.42,
    minPrice: 380.00,
    maxPrice: 850.00,
    totalVolume: 42500,
    hourly: generateRdnProfile()
};

export const MOCK_FUTURES: FuturesContract[] = [
    { id: '1', name: 'BASE_M-02-25', group: 'Energia', period: 'M', deliveryDate: '2025-02-01', price: 495.00, changePercent: -1.2, volume: 150 },
    { id: '2', name: 'BASE_Q-02-25', group: 'Energia', period: 'Q', deliveryDate: '2025-04-01', price: 480.00, changePercent: -0.5, volume: 50 },
    { id: '3', name: 'BASE_Y-26', group: 'Energia', period: 'Y', deliveryDate: '2026-01-01', price: 460.00, changePercent: 0.2, volume: 300 },
    { id: '4', name: 'PEAK_M-02-25', group: 'Energia', period: 'M', deliveryDate: '2025-02-01', price: 610.00, changePercent: -1.5, volume: 80 },
    { id: '5', name: 'GAS_M-02-25', group: 'Gaz', period: 'M', deliveryDate: '2025-02-01', price: 185.50, changePercent: 2.1, volume: 2000 },
    { id: '6', name: 'GAS_Q-02-25', group: 'Gaz', period: 'Q', deliveryDate: '2025-04-01', price: 190.00, changePercent: 1.8, volume: 1500 },
    { id: '7', name: 'GAS_Y-26', group: 'Gaz', period: 'Y', deliveryDate: '2026-01-01', price: 175.00, changePercent: 0.5, volume: 0 },
    { id: '8', name: 'CO2-DEC-25', group: 'CO2', period: 'Y', deliveryDate: '2025-12-01', price: 68.20, changePercent: 0.5, volume: 5000 },
    { id: '9', name: 'CO2-DEC-26', group: 'CO2', period: 'Y', deliveryDate: '2026-12-01', price: 72.50, changePercent: 0.8, volume: 1200 },
    // Add more mock data for "Market Movers" effect
    { id: '10', name: 'BASE_M-03-25', group: 'Energia', period: 'M', deliveryDate: '2025-03-01', price: 488.50, changePercent: 3.4, volume: 450 }, // Top gainer
    { id: '11', name: 'PEAK_Y-26', group: 'Energia', period: 'Y', deliveryDate: '2026-01-01', price: 580.00, changePercent: -2.8, volume: 120 }, // Top loser
];

export const MOCK_NEWS: NewsItem[] = [
    { id: '1', title: 'Rekordowa generacja wiatrowa w Polsce: 9 GW w szczycie', source: 'PSE / High Voltage', category: 'PSE', timestamp: '2024-01-04T10:30:00', isImportant: true, url: '#', summary: 'Generacja wiatrowa pokryła 40% zapotrzebowania KSE. Ceny ujemne na RDN.' },
    { id: '2', title: 'Parlament Europejski debatuje nad nowymi celami redukcji metanu', source: 'EuroPAP', category: 'EU', timestamp: '2024-01-04T09:15:00', isImportant: false, url: '#', summary: 'Nowe regulacje mogą wpłynąć na koszty importu gazu LNG.' },
    { id: '3', title: 'URE zatwierdza taryfy dystrybucyjne na rok 2025', source: 'URE.gov.pl', category: 'URE', timestamp: '2024-01-03T16:00:00', isImportant: true, url: '#', summary: 'Średni wzrost opłat dystrybucyjnych o 5.2%. Nowe stawki opłaty mocowej.' },
    { id: '4', title: 'TGE: Wolumen obrotu gwarancjami pochodzenia spadł o 15%', source: 'TGE Raport', category: 'TGE', timestamp: '2024-01-03T12:00:00', isImportant: false, url: '#', summary: 'Niższa podaż OZE w Q4 wpłynęła na obroty.' },
    { id: '5', title: 'Gazprom grozi wstrzymaniem tranzytu przez Ukrainę', source: 'Reuters Energy', category: 'Gaz', timestamp: '2024-01-02T18:45:00', isImportant: true, url: '#', summary: 'Ryzyko wzrostu cen TTF w najbliższych tygodniach.' },
];
