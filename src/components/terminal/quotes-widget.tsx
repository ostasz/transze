"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function QuoteTable({ data }: { data: any[] }) {
    if (!data.length) {
        return <div className="p-4 text-center text-sm text-gray-500">Brak danych dla wybranego instrumentu.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Instrument</TableHead>
                    <TableHead className="text-right">Cena (PLN/MWh)</TableHead>
                    <TableHead className="text-right">Zmiana (%)</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Wolumen</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((item) => (
                    <TableRow key={item.contract}>
                        <TableCell className="font-medium">{item.contract}</TableCell>
                        <TableCell className="text-right font-bold">
                            {item.price?.toFixed(2) || "-"}
                        </TableCell>
                        <TableCell className={`text-right ${item.change > 0 ? "text-green-600" : item.change < 0 ? "text-red-600" : ""}`}>
                            {item.change > 0 ? "+" : ""}{item.change?.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-muted-foreground">{item.volume}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export function QuotesWidget() {
    const [powerData, setPowerData] = useState<any[]>([])
    const [gasData, setGasData] = useState<any[]>([])
    const [co2Data, setCo2Data] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [dataDate, setDataDate] = useState<string>("")

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                // Fetch in parallel
                const [powerRes, gasRes, co2Res] = await Promise.all([
                    fetch('/api/energy-prices/futures/details?contract=BASE_Y-26'),
                    fetch('/api/energy-prices/futures/details?contract=GAS_Y-26'), // Assuming GAS prefix logic works
                    fetch('/api/energy-prices/futures/details?contract=CO2-EUA-DEC-25') // Assuming CO2 logic
                ]);

                const powerJson = powerRes.ok ? await powerRes.json() : { ticker: [] };
                const gasJson = gasRes.ok ? await gasRes.json() : { ticker: [] };
                const co2Json = co2Res.ok ? await co2Res.json() : { ticker: [] };

                setPowerData(powerJson.ticker || []);
                setGasData(gasJson.ticker || []);
                setCo2Data(co2Json.ticker || []);

                if (powerJson.effectiveDate) setDataDate(powerJson.effectiveDate);
            } catch (error) {
                console.error("Failed to fetch quotes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, []);

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Notowania {dataDate ? `(${dataDate})` : ""}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="power" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="power">Energia (TGE)</TabsTrigger>
                        <TabsTrigger value="gas">Gaz</TabsTrigger>
                        <TabsTrigger value="co2">CO2</TabsTrigger>
                    </TabsList>
                    <TabsContent value="power">
                        {loading ? <div className="p-4 text-center">Ładowanie...</div> : <QuoteTable data={powerData} />}
                    </TabsContent>
                    <TabsContent value="gas">
                        {loading ? <div className="p-4 text-center">Ładowanie...</div> : <QuoteTable data={gasData} />}
                    </TabsContent>
                    <TabsContent value="co2">
                        {loading ? <div className="p-4 text-center">Ładowanie...</div> : <QuoteTable data={co2Data} />}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
