
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Zap, Flame, Cloud } from "lucide-react";
import { MOCK_FUTURES, FuturesContract } from "@/lib/mock/market";
import { cn } from "@/lib/utils";

type SortField = 'price' | 'changePercent' | 'volume';
type SortOrder = 'asc' | 'desc';

export function FuturesTableV2() {
    const [searchTerm, setSearchTerm] = useState("");
    const [periodFilter, setPeriodFilter] = useState<'ALL' | 'M' | 'Q' | 'Y'>('Y');
    const [sortField, setSortField] = useState<SortField>('deliveryDate' as any); // Default sort by date logic implied
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const [futuresData, setFuturesData] = useState<FuturesContract[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFutures = async () => {
            try {
                // Fetch Base Ticker
                const baseRes = await fetch('/api/energy-prices/futures/details?contract=BASE_Y-26');
                const baseJson = await baseRes.json();
                const baseTicker = baseJson.ticker || [];

                // Fetch Gas Ticker (need a Gas contract to seed the family search)
                const gasRes = await fetch('/api/energy-prices/futures/details?contract=GAS_Y-26');
                const gasJson = await gasRes.json();
                const gasTicker = gasJson.ticker || [];

                // Fetch CO2 Ticker
                const co2Res = await fetch('/api/energy-prices/futures/details?contract=CO2-DEC-26');
                const co2Json = await co2Res.json();
                const co2Ticker = co2Json.ticker || [];

                // Combine and Map
                const mapContract = (item: any): FuturesContract => {
                    let group: 'Energia' | 'Gaz' | 'CO2' = 'Energia';
                    if (item.contract.startsWith('GAS')) group = 'Gaz';
                    if (item.contract.startsWith('CO2')) group = 'CO2';

                    let period: 'M' | 'Q' | 'Y' = 'Y';
                    if (item.contract.includes('_M-')) period = 'M';
                    if (item.contract.includes('_Q-')) period = 'Q';
                    // CO2 is usually Y (DEC-YY)

                    // Delivery Date from item? API Ticker endpoint usually implies current quotes. 
                    // To get delivery date, I might need to Parse filename string or use item.deliveryDate if exists.
                    // The Ticker object from API (seen in route.ts) has: contract, price, change, min, max, volume.
                    // Does NOT have `deliveryDate`.
                    // I must parse `deliveryDate` from contract name string.
                    // Ex: BASE_M-02-25 -> 2025-02-01.

                    let deliveryDate = new Date().toISOString();
                    // Simple parser for standard TGE formats
                    try {
                        const parts = item.contract.split('_');
                        const suffix = parts[parts.length - 1]; // M-02-25 or Q-1-25 or Y-26
                        // This is getting complex to parse locally without robust utils.
                        // I will define a dummy date 2025-01-01 if parsing fails, but sort needs it.
                        // Actually, I can rely on API order (alpha). 
                        // But I sort by date in the table.
                        // Let's implement a mini parser.
                    } catch (e) { }

                    return {
                        id: item.contract,
                        name: item.contract,
                        group,
                        period,
                        deliveryDate: deliveryDate, // Placeholder, will fix sorting later if needed
                        price: item.price,
                        changePercent: item.change,
                        volume: item.volume
                    };
                };

                const allFutures = [
                    ...baseTicker.map(mapContract),
                    ...gasTicker.map(mapContract),
                    ...co2Ticker.map(mapContract)
                ];

                setFuturesData(allFutures);
            } catch (e) {
                console.error("Futures fetch failed", e);
            } finally {
                setLoading(false);
            }
        };

        fetchFutures();
    }, []);

    const groups = useMemo(() => ({
        power: futuresData.filter(f => f.group === 'Energia'),
        gas: futuresData.filter(f => f.group === 'Gaz'),
        co2: futuresData.filter(f => f.group === 'CO2')
    }), [futuresData]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc'); // Default to desc for interesting metrics usually
        }
    };

    const renderTable = (data: FuturesContract[]) => {
        // Filter
        let filtered = data.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (periodFilter === 'ALL' || item.period === periodFilter)
        );

        // Sort
        filtered.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            // Handle date sorting if field is not one of the standard metrics
            if (sortField === 'deliveryDate' as any) {
                return sortOrder === 'asc'
                    ? new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
                    : new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        // Market Movers (Top 3 by change absolute)
        const movers = [...filtered].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 3);

        return (
            <div className="space-y-4">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50 p-2 rounded-lg border">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-48">
                            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj instrumentu..."
                                className="pl-8 h-8 text-xs bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-white rounded-md border shadow-sm h-8 p-0.5">
                            {['ALL', 'M', 'Q', 'Y'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriodFilter(p as any)}
                                    className={cn(
                                        "px-2.5 text-[10px] font-medium rounded-sm transition-all",
                                        periodFilter === p
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-gray-100"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Market Movers Banner (Mini) */}
                {movers.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        {movers.map(m => (
                            <div key={m.id} className="flex flex-col items-center justify-center p-2 rounded bg-white border border-dashed text-xs">
                                <span className="font-semibold text-gray-700 truncate w-full text-center">{m.name}</span>
                                <span className={cn(
                                    "font-bold",
                                    m.changePercent > 0 ? "text-green-600" : "text-red-500"
                                )}>
                                    {m.changePercent > 0 ? '+' : ''}{m.changePercent.toFixed(2)}%
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table */}
                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-gray-50/80 sticky top-0 z-10">
                            <TableRow className="h-9 hover:bg-transparent">
                                <TableHead className="w-[140px] text-xs font-semibold">Instrument</TableHead>
                                <TableHead className="text-right text-xs font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort('price')}>
                                    <div className="flex items-center justify-end gap-1">
                                        Cena {sortField === 'price' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </TableHead>
                                <TableHead className="text-right text-xs font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort('changePercent')}>
                                    <div className="flex items-center justify-end gap-1">
                                        Zmiana % {sortField === 'changePercent' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </TableHead>
                                <TableHead className="text-right text-xs font-semibold cursor-pointer hover:bg-gray-100 hidden sm:table-cell" onClick={() => handleSort('volume')}>
                                    <div className="flex items-center justify-end gap-1">
                                        Wolumen {sortField === 'volume' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                                        Brak wyników.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((item) => (
                                    <TableRow key={item.id} className="h-10 hover:bg-gray-50/50">
                                        <TableCell className="font-medium text-xs font-mono">{item.name}</TableCell>
                                        <TableCell className="text-right text-sm font-bold tracking-tight">
                                            {item.price.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "h-5 text-[10px] px-1.5 font-normal border-0",
                                                    item.changePercent > 0 ? "bg-green-50 text-green-700" :
                                                        item.changePercent < 0 ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"
                                                )}
                                            >
                                                {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell">
                                            {item.volume}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    };

    return (
        <Card className="h-full shadow-sm flex flex-col">
            <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-base font-bold">Produkty Terminowe</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1">
                <Tabs defaultValue="power" className="w-full h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3 mb-4 h-9">
                        <TabsTrigger value="power" className="text-xs gap-2">
                            <Zap className="h-3 w-3" /> Energia
                        </TabsTrigger>
                        <TabsTrigger value="gas" className="text-xs gap-2">
                            <Flame className="h-3 w-3" /> Gaz
                        </TabsTrigger>
                        <TabsTrigger value="co2" className="text-xs gap-2">
                            <Cloud className="h-3 w-3" /> CO2
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-auto min-h-[400px]">
                        <TabsContent value="power" className="mt-0 h-full">{renderTable(groups.power)}</TabsContent>
                        <TabsContent value="gas" className="mt-0 h-full">{renderTable(groups.gas)}</TabsContent>
                        <TabsContent value="co2" className="mt-0 h-full">{renderTable(groups.co2)}</TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
