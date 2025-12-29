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

    const handleGmailImport = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch("/api/cron/import-email");
            const data = await response.json();
            if (response.ok) {
                setResult(`Sukces! Przetworzono ${data.processedEmails || 0} wiadomości. Zapisano ${data.totalRecords || 0} rekordów.`);
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
                            contract: findVal(['Kontrakt', 'contract', 'instrument']),
                            DKR: parsePolishNumber(findVal(['Kurs', 'price', 'rozliczeniowy'])),
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

            {/* Manual Gmail Trigger */}
            <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Automatyczna Synchronizacja</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Pobierz najnowsze notowania RDN bezpośrednio z wiadomości e-mail (TGE).
                        <br />
                        Skrypt przeszuka skrzynkę Gmail w poszukiwaniu wiadomości "Subscription for tge_p".
                    </div>
                    <Button onClick={handleGmailImport} disabled={loading} variant="outline" className="border-teal-600 text-teal-700 hover:bg-teal-50">
                        {loading ? "Pobieranie..." : "Uruchom Import z Gmaila"}
                    </Button>
                </CardContent>
            </Card>

            <Tabs defaultValue="rdn" className="w-full">
                <TabsList>
                    <TabsTrigger value="rdn">RDN (Plik CSV)</TabsTrigger>
                    <TabsTrigger value="futures">Futures (Plik CSV)</TabsTrigger>
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
                                />
                                <Button disabled={loading}>
                                    {loading ? "Przetwarzanie..." : "Wgraj plik"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
