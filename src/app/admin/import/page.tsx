"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parsePolishNumber } from "@/lib/import-utils";

export default function ImportPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleGmailImport = async (type: 'rdn' | 'futures' = 'rdn') => {
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch(`/api/cron/import-email?type=${type}`);
            const data = await response.json();
            if (response.ok) {
                setResult(`Sukces! [${type.toUpperCase()}] Przetworzono ${data.processedEmails || 0} wiadomości. Szczegóły: ${data.details}`);
            } else {
                setResult(`Błąd: ${data.details || data.error}`);
            }
        } catch (error) {
            console.error(error);
            setResult("Wystąpił błąd podczas łączenia z serwerem.");
        } finally {
            setLoading(false);
        }
    };

    const handleRDNUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setResult(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    // Normalize CSV keys to lowercase for easier matching
                    const normalizedData = results.data.map((row: any) => {
                        // Find keys ignoring case
                        const findVal = (keys: string[]) => {
                            const rowKeys = Object.keys(row);
                            const match = rowKeys.find(k => keys.some(target => k.toLowerCase().includes(target.toLowerCase())));
                            return match ? row[match] : undefined;
                        };

                        return {
                            date: findVal(['data', 'date', 'doba']),
                            hour: findVal(['godzina', 'hour']),
                            price: parsePolishNumber(findVal(['kurs', 'price', 'fixing'])),
                            volume: parsePolishNumber(findVal(['wolumen', 'volume']))
                        };
                    });

                    const response = await fetch("/api/admin/import/rdn", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ data: normalizedData }),
                    });

                    const data = await response.json();
                    if (data.success) {
                        setResult(`Succes! Imported ${data.count} RDN records.`);
                    } else {
                        setResult(`Error: ${data.error}`);
                    }
                } catch (error) {
                    setResult("Upload failed.");
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleFuturesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Try to derive contract from filename if possible (e.g. "ckh26.f.csv" -> "CO2-MAR-26")
        // Simple heuristic: if filename contains "ck", assume CO2.
        let defaultContract = "";
        const name = file.name.toLowerCase();
        if (name.includes("ck.f")) defaultContract = "CO2-EUA-SPOT";
        else if (name.includes("ckh")) defaultContract = `CO2-EUA-MAR-${name.match(/ckh(\d+)/)?.[1] || "26"}`;
        else if (name.includes("ckm")) defaultContract = `CO2-EUA-JUN-${name.match(/ckm(\d+)/)?.[1] || "26"}`;
        else if (name.includes("cku")) defaultContract = `CO2-EUA-SEP-${name.match(/cku(\d+)/)?.[1] || "26"}`;
        else if (name.includes("ckz")) defaultContract = `CO2-EUA-DEC-${name.match(/ckz(\d+)/)?.[1] || "26"}`;

        setLoading(true);
        setResult(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const normalizedData = results.data.map((row: any) => {
                        const findVal = (keys: string[]) => {
                            const rowKeys = Object.keys(row);
                            const match = rowKeys.find(k => keys.some(target => k.toLowerCase().includes(target.toLowerCase())));
                            return match ? row[match] : undefined;
                        }

                        return {
                            date: findVal(['Data', 'date']),
                            contract: findVal(['Kontrakt', 'contract', 'instrument']) || defaultContract || "",
                            DKR: parsePolishNumber(findVal(['Kurs', 'price', 'rozliczeniowy', 'close'])),
                            volume: parsePolishNumber(findVal(['Wolumen', 'volume'])),
                            openInterest: parsePolishNumber(findVal(['Liczba otwartych', 'open interest', 'lop']))
                        };
                    });

                    const response = await fetch("/api/admin/import/futures", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ data: normalizedData }),
                    });

                    const data = await response.json();
                    if (data.success) {
                        setResult(`Success! Imported ${data.count} Futures records.`);
                    } else {
                        setResult(`Error: ${data.error}`);
                    }
                } catch (error) {
                    setResult("Upload failed.");
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Import Danych Rynkowych</h1>
            </div>

            {result && (
                <div className={`p-4 rounded-md ${result.startsWith("Błąd") || result.startsWith("Error") || result.startsWith("Upload failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {result}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manual Gmail Trigger RDN */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Synchronizacja RDN (tge_p)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="text-sm text-gray-600">
                            Pobierz notowania RDN z wiadomości e-mail "Subscription for tge_p".
                        </div>
                        <Button onClick={() => handleGmailImport('rdn')} disabled={loading} variant="outline" className="w-full border-teal-600 text-teal-700 hover:bg-teal-50">
                            {loading ? "Pobieranie..." : "Importuj RDN z Gmaila"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Manual Gmail Trigger Futures */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Synchronizacja Futures (tge_rtpe)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="text-sm text-gray-600">
                            Pobierz notowania Terminowe z wiadomości e-mail "Subscription for tge_rtpe".
                        </div>
                        <Button onClick={() => handleGmailImport('futures')} disabled={loading} variant="outline" className="w-full border-blue-600 text-blue-700 hover:bg-blue-50">
                            {loading ? "Pobieranie..." : "Importuj Futures z Gmaila"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="rdn" className="w-full">
                <TabsList>
                    <TabsTrigger value="rdn">RDN (Plik CSV)</TabsTrigger>
                    <TabsTrigger value="futures">Futures (Plik CSV)</TabsTrigger>
                    <TabsTrigger value="co2">CO2 (Stooq CSV)</TabsTrigger>
                </TabsList>

                <TabsContent value="rdn">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import notowań RDN (CSV)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Wymagane kolumny: Data, Godzina, Kurs (PLN/MWh), Wolumen.
                            </p>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleRDNUpload}
                                    disabled={loading}
                                />
                                <Button disabled={loading}>
                                    {loading ? "Przetwarzanie..." : "Wgraj plik"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="futures">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import notowań Terminowych (CSV)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Wymagane kolumny: Data, Kontrakt (np. BASE_Y-26), Kurs Rozliczeniowy.
                            </p>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFuturesUpload}
                                    disabled={loading}
                                    id="futures-upload"
                                />
                                <Button disabled={loading} onClick={() => document.getElementById('futures-upload')?.click()}>
                                    {loading ? "Przetwarzanie..." : "Wgraj plik Futures"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="co2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import CO2 / GAS (Stooq CSV)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Format Stooq: Date, Open, High, Low, Close, Volume.<br />
                                Nazwa pliku powinna zawierać ticker (np. <code>ck.f.csv</code> lub <code>ckh26.f.csv</code>).
                            </p>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFuturesUpload} // We can reuse this as it maps closely, or refine if needed
                                    disabled={loading}
                                />
                                <Button disabled={loading}>
                                    {loading ? "Przetwarzanie..." : "Wgraj plik ze Stooq"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
