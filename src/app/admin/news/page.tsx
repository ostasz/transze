
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch" // Assuming available
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Play, Plus, Trash2 } from "lucide-react"

export default function NewsAdminPage() {
    const [sources, setSources] = useState<any[]>([])
    const [schedule, setSchedule] = useState<any>(null)

    const fetchSources = async () => {
        const res = await fetch("/api/admin/news/sources")
        if (res.ok) setSources(await res.json())
    }

    // Stub for schedule fetch
    // const fetchSchedule = ...

    useEffect(() => {
        fetchSources()
    }, [])

    const toggleSource = async (id: string, current: boolean) => {
        // Optimistic update
        setSources(sources.map(s => s.id === id ? { ...s, isActive: !current } : s))
        // API Call (PATCH not implemented in route.ts above for brevity, but would go here)
    }

    const runIngest = async () => {
        await fetch("/api/cron/news-ingest?force=true")
        alert("Ingest Triggered")
        fetchSources()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Zarządzanie Wiadomościami</h1>
                <p className="text-muted-foreground">Konfiguracja źródeł RSS i harmonogramu pobierania.</p>
            </div>

            <Tabs defaultValue="sources" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sources">Źródła</TabsTrigger>
                    <TabsTrigger value="schedule">Harmonogram</TabsTrigger>
                    <TabsTrigger value="moderation">Moderacja</TabsTrigger>
                </TabsList>

                <TabsContent value="sources" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle>Zdefiniowane Źródła</CardTitle>
                                <CardDescription>Lista źródeł RSS skanowanych przez system</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={runIngest} variant="secondary">
                                    <Play className="mr-2 h-4 w-4" /> Uruchom Pobieranie
                                </Button>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Dodaj Źródło
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nazwa</TableHead>
                                        <TableHead>Typ</TableHead>
                                        <TableHead>Priorytet</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ost. Aktualizacja</TableHead>
                                        <TableHead className="text-right">Akcje</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sources.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium">{s.name}</TableCell>
                                            <TableCell>{s.type}</TableCell>
                                            <TableCell>{s.priority}</TableCell>
                                            <TableCell>
                                                {s.lastFetchStatus === 'OK' ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">OK</Badge>
                                                ) : s.lastFetchStatus === 'ERROR' ? (
                                                    <Badge variant="destructive">Błąd</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Nieznany</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {s.lastFetchedAt ? new Date(s.lastFetchedAt).toLocaleString() : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Switch
                                                    checked={s.isActive}
                                                    onCheckedChange={() => toggleSource(s.id, s.isActive)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule">
                    <Card>
                        <CardHeader>
                            <CardTitle>Konfiguracja Harmonogramu</CardTitle>
                            <CardDescription>Ustawienia Vercel Cron oraz bramek czasowych DB.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border p-4 bg-muted/50">
                                <p className="text-sm font-mono">CRON jest sterowany globalnie przez Vercel (co 15 min).</p>
                                <p className="text-sm mt-2">Logika bazodanowa decyduje o faktycznym uruchomieniu pobierania.</p>
                            </div>
                            {/* Schedule config form would go here */}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
