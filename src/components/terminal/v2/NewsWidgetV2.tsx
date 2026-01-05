"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, ExternalLink, Globe, AlertCircle, FileText } from "lucide-react";
import { MOCK_NEWS, NewsItem } from "@/lib/mock/market";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export function NewsWidgetV2() {
    const [filterImportant, setFilterImportant] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async (isBackground = false) => {
            if (!isBackground) setLoading(true);
            try {
                const res = await fetch('/api/news');
                if (!res.ok) throw new Error('Failed to fetch news');
                const data = await res.json();

                // Map API response to UI model
                const mappedNews: NewsItem[] = data.map((item: any) => ({
                    id: item.id,
                    category: mapSourceToCategory(item.source?.name || 'Inne'),
                    title: item.title,
                    timestamp: item.publishedAt || item.fetchedAt,
                    isImportant: item.importance >= 60 || item.isPinned,
                    source: item.source?.name || 'Redakcja',
                    summary: item.excerpt,
                    url: item.url
                }));
                setNews(mappedNews);
            } catch (err) {
                console.error("News fetch error", err);
            } finally {
                if (!isBackground) setLoading(false);
            }
        };

        fetchNews();

        // Auto-refresh every 5 minutes
        const intervalId = setInterval(() => {
            fetchNews(true);
        }, 300000);

        return () => clearInterval(intervalId);
    }, []);

    // Helper to map source names to UI categories
    const mapSourceToCategory = (sourceName: string): NewsItem['category'] => {
        if (sourceName.includes('Ekovoltis')) return 'Ekovoltis';
        if (sourceName.includes('PSE') || sourceName.includes('Sieci')) return 'PSE';
        if (sourceName.includes('URE') || sourceName.includes('Regulacji')) return 'URE';
        if (sourceName.includes('CIRE') || sourceName.includes('WNP')) return 'TGE'; // General industry
        if (sourceName.includes('BiznesAlert')) return 'Gaz';
        if (sourceName.includes('Bloomberg') || sourceName.includes('Reuters')) return 'EU';
        return 'TGE'; // Default
    };

    const getCategoryDetails = (cat: NewsItem['category']) => {
        switch (cat) {
            case 'Ekovoltis': return { color: "bg-[#00A69C]/10 text-[#00A69C] border-[#00A69C]/20", icon: <EkovoltisIcon className="h-3 w-3" /> };
            case 'PSE': return { color: "bg-blue-100 text-blue-700 border-blue-200", icon: <Globe className="h-3 w-3" /> };
            case 'URE': return { color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <FileText className="h-3 w-3" /> };
            case 'EU': return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Globe className="h-3 w-3" /> };
            case 'TGE': return { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <Globe className="h-3 w-3" /> };
            case 'Gaz': return { color: "bg-orange-100 text-orange-700 border-orange-200", icon: <FlameIcon className="h-3 w-3" /> };
            case 'CO2': return { color: "bg-gray-100 text-gray-700 border-gray-200", icon: <CloudIcon className="h-3 w-3" /> };
            default: return { color: "bg-slate-100 text-slate-700", icon: <Globe className="h-3 w-3" /> };
        }
    };

    const ensureProtocol = (url?: string) => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    const filteredNews = (news.length > 0 ? news : []).filter(item => {
        const matchesHashtag = filterImportant ? item.isImportant : true;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.source.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesHashtag && matchesSearch;
    });

    return (
        <Card className="h-full flex flex-col shadow-sm">
            <CardHeader className="py-3 px-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">Wiadomości Rynkowe</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="important-mode"
                            checked={filterImportant}
                            onCheckedChange={setFilterImportant}
                            className="scale-90"
                        />
                        <Label htmlFor="important-mode" className="text-xs font-medium cursor-pointer">
                            Tylko Ważne
                        </Label>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj newsów..."
                        className="pl-8 h-8 text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[400px]">
                <ScrollArea className="h-full">
                    <div className="flex flex-col divide-y">
                        {loading && news.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                Ładowanie wiadomości...
                            </div>
                        ) : filteredNews.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                Brak wiadomości spełniających kryteria.
                            </div>
                        ) : (
                            filteredNews.map((news) => {
                                const details = getCategoryDetails(news.category);
                                return (
                                    <div key={news.id} className="p-4 hover:bg-gray-50/80 transition-colors group">
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className={cn("px-1.5 py-0 h-5 text-[10px] font-medium border gap-1", details.color)}>
                                                    {details.icon} {news.category}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {format(new Date(news.timestamp), "d MMM HH:mm", { locale: pl })}
                                                </span>
                                            </div>
                                            {news.isImportant && (
                                                <Badge variant="default" className="bg-red-500 hover:bg-red-600 h-5 px-1.5 text-[9px] uppercase tracking-wider">
                                                    Pilne
                                                </Badge>
                                            )}
                                        </div>

                                        <h4 className="text-sm font-semibold leading-tight mb-2 text-gray-900 group-hover:text-primary transition-colors">
                                            {news.title}
                                        </h4>

                                        {news.isImportant && news.summary && (
                                            <div className="mb-2 p-2 bg-amber-50 rounded border border-amber-100 flex gap-2 items-start">
                                                <AlertCircle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                                                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                                    <span className="font-bold text-amber-900/80 mr-1">Dlaczego ważne:</span>
                                                    {news.summary}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                                {news.source}
                                            </span>
                                            <a href={ensureProtocol(news.url)} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-1 text-primary hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                Czytaj <ExternalLink className="h-2.5 w-2.5" />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

// Icons placeholders for category specific
function FlameIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3a1 1 0 0 0 .9 2.5z" /></svg> }
function CloudIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c0-1.7-1.3-3-3-3h-11a3 3 0 0 0-3 3h17z" /><path d="M19 19a5 5 0 0 0-1-9.9 5 5 0 0 0-8-2.1 5 5 0 0 0-9.9 1 5 5 0 0 0 1.9 11" /></svg> }
function EkovoltisIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 10c0-3-2-5-5-5s-5 2-5 5v4a5 5 0 0 0 10 0" /><path d="M6 12h10" /></svg> }
