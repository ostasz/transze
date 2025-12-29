"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const MOCK_DATA_POWER = [
    { symbol: "BASE_Y_26", price: 450.50, change: 1.2, volume: 5 },
    { symbol: "BASE_Q3_25", price: 420.00, change: -0.5, volume: 10 },
    { symbol: "PEAK_Y_26", price: 580.20, change: 2.1, volume: 2 },
    { symbol: "BASE_M_08_25", price: 390.10, change: 0.0, volume: 0 },
]

const MOCK_DATA_GAS = [
    { symbol: "GAS_Y_26", price: 180.50, change: -1.2, volume: 15 },
    { symbol: "GAS_Q4_25", price: 210.00, change: 3.5, volume: 20 },
]

const MOCK_DATA_CO2 = [
    { symbol: "DEC_25", price: 65.20, change: 0.8, volume: 100 },
    { symbol: "DEC_26", price: 68.50, change: 0.9, volume: 50 },
]

function QuoteTable({ data }: { data: any[] }) {
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
                    <TableRow key={item.symbol}>
                        <TableCell className="font-medium">{item.symbol}</TableCell>
                        <TableCell className="text-right font-bold">
                            {item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right ${item.change > 0 ? "text-green-600" : item.change < 0 ? "text-red-600" : ""}`}>
                            {item.change > 0 ? "+" : ""}{item.change}%
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-muted-foreground">{item.volume}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export function QuotesWidget() {
    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Notowania</CardTitle>
                    <Badge variant="outline" className="text-xs">Live (Delay 15m)</Badge>
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
                        <QuoteTable data={MOCK_DATA_POWER} />
                    </TabsContent>
                    <TabsContent value="gas">
                        <QuoteTable data={MOCK_DATA_GAS} />
                    </TabsContent>
                    <TabsContent value="co2">
                        <QuoteTable data={MOCK_DATA_CO2} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
