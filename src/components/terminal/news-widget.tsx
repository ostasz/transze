
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Search, RefreshCw, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NewsItemEnriched {
    id: string
    title: string
    excerpt: string | null
    url: string
    source: { name: string }
    publishedAt: string | null
    tags: string[]
    importance: number
    isBookmarked: boolean
}

export function NewsWidget() {
    const [items, setItems] = useState<NewsItemEnriched[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState("top") // 'top', 'all'
    const [search, setSearch] = useState("")

    const fetchNews = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (view === 'top') params.set("type", "top")
            if (search) params.set("q", search)

            const res = await fetch(`/api/news?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setItems(data)
            }
        } catch (e) {
            console.error("Failed to fetch news", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => fetchNews(), 300)
        return () => clearTimeout(timer)
    }, [view, search])

    const handleViewChange = (v: string) => {
        setView(v)
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 space-y-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Wiadomości Rynkowe</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => fetchNews()} disabled={loading} className="h-6 w-6">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    <Tabs value={view} onValueChange={handleViewChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="top">Ważne</TabsTrigger>
                            <TabsTrigger value="all">Wszystkie</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Szukaj..."
                            className="pl-8 h-9 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full px-4 pb-4">
                    <div className="space-y-4 pt-1">
                        {loading && items.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 text-sm">Ładowanie...</div>
                        ) : items.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 text-sm">Brak wiadomości</div>
                        ) : (
                            items.map((news) => (
                                <div key={news.id} className="border-b last:border-0 pb-3 last:pb-0 group">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 w-full">
                                            <a
                                                href={news.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-sm hover:text-primary transition-colors line-clamp-2 block"
                                            >
                                                {news.title}
                                            </a>
                                            {news.excerpt && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                    {news.excerpt}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-semibold text-primary">{news.source.name}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString('pl-PL', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            {news.tags.slice(0, 1).map(t => (
                                                <Badge key={t} variant="outline" className="text-[9px] h-4 px-1 border-primary/20">{t}</Badge>
                                            ))}
                                            <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary ml-1">
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
