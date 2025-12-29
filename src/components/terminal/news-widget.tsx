"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area" // Assuming ScrollArea exists or using div overflow
import { ExternalLink } from "lucide-react"

const MOCK_NEWS = [
    {
        id: 1,
        title: "Rekordowe ceny uprawnień CO2 w grudniu",
        summary: "Ceny uprawnień do emisji CO2 osiągnęły nowy poziom oporu na giełdzie EEX...",
        source: "WysokieNapiecie.pl",
        date: "2025-12-27",
        tag: "CO2"
    },
    {
        id: 2,
        title: "TGE ogłasza zmiany w indeksach BASE",
        summary: "Towarowa Giełda Energii wprowadza nowe zasady wyznaczania indeksu BASE od...",
        source: "TGE",
        date: "2025-12-26",
        tag: "Regulacje"
    },
    {
        id: 3,
        title: "Nowelizacja ustawy o OZE podpisana",
        summary: "Prezydent podpisał nowelizację ustawy o OZE wprowadzającą nowe systemy wsparcia...",
        source: "CIRE",
        date: "2025-12-25",
        tag: "Polska"
    },
]

export function NewsWidget() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Wiadomości Rynkowe</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {MOCK_NEWS.map((news) => (
                        <div key={news.id} className="border-b last:border-0 pb-3 last:pb-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-sm hover:text-primary cursor-pointer transition-colors">
                                        {news.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {news.summary}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">{news.tag}</Badge>
                                <span className="text-[10px] text-muted-foreground">{news.source} • {news.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
