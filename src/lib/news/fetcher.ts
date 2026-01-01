
import Parser from "rss-parser"
import * as cheerio from "cheerio"
import dns from "dns/promises"
import { URL } from "url"
import crypto from "crypto"

// We can implement simple IP range checks without ipaddr.js to avoid extra deps if possible,
// but ipaddr.js makes it safer. I'll rely on string matching for simplicity or check if I can install ipaddr.js.
// "enterprise-grade" => safe.
// Let's assume standard private ranges.

const PRIVATE_RANGES = [
    { start: "127.0.0.0", end: "127.255.255.255" },
    { start: "10.0.0.0", end: "10.255.255.255" },
    { start: "172.16.0.0", end: "172.31.255.255" },
    { start: "192.168.0.0", end: "192.168.255.255" },
    { start: "169.254.0.0", end: "169.254.255.255" },
    { start: "0.0.0.0", end: "0.0.0.0" }
]

function isIpPrivate(ip: string): boolean {
    if (ip === "::1") return true
    if (ip.startsWith("fc")) return true // Unique Local IPv6
    if (ip.startsWith("fe80")) return true // Link-local IPv6

    // IPv4 primitive check
    const parts = ip.split('.').map(Number)
    if (parts.length !== 4) return false; // Not IPv4 or handled above

    // 127.x.x.x
    if (parts[0] === 127) return true
    // 10.x.x.x
    if (parts[0] === 10) return true
    // 192.168.x.x
    if (parts[0] === 192 && parts[1] === 168) return true
    // 169.254.x.x
    if (parts[0] === 169 && parts[1] === 254) return true
    // 172.16.x.x - 172.31.x.x
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true

    return false
}

async function safeFetch(url: string, redirectCount = 0): Promise<string> {
    if (redirectCount > 3) throw new Error("Too many redirects")

    const parsedUrl = new URL(url)

    // 1. DNS Resolution & SSRF Check
    const ips = await dns.resolve(parsedUrl.hostname).catch(() => null)
    if (!ips || ips.length === 0) throw new Error(`Could not resolve host: ${parsedUrl.hostname}`)

    const targetIp = ips[0]
    if (isIpPrivate(targetIp)) {
        throw new Error(`SSRF Blocked: ${url} resolves to private IP ${targetIp}`)
    }

    // 2. Fetch with constraints
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            redirect: 'manual', // Handle redirects manually to re-check IP
            headers: {
                "User-Agent": "EkovoltisBot/1.0 (Enterprise Energy News Aggregator)"
            }
        })

        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get("location")
            if (!location) throw new Error("Redirect without location")

            // Resolve relative URLs
            const redirectUrl = new URL(location, url).toString()
            return safeFetch(redirectUrl, redirectCount + 1)
        }

        if (!response.ok) throw new Error(`HTTP Error ${response.status} for ${url}`)

        // Size check (simulated via text length check after, streaming is better but complex for this snippet)
        // With 'text()', we buffer. 2MB max.
        const text = await response.text()
        if (text.length > 2 * 1024 * 1024) throw new Error("Content too large (>2MB)")

        return text

    } finally {
        clearTimeout(timeout)
    }
}

const parser = new Parser({
    customFields: {
        item: ['dc:date', 'category']
    }
})

export interface ParsedItem {
    title: string
    link: string
    canonicalUrl: string
    pubDate: Date | null
    excerpt: string
    tags: string[]
    hash: string
}

export async function fetchAndParseFeed(feedUrl: string): Promise<ParsedItem[]> {
    const rawXml = await safeFetch(feedUrl)
    const feed = await parser.parseString(rawXml)

    const items: ParsedItem[] = []

    for (const item of feed.items) {
        if (!item.title || !item.link) continue

        // Canonicalize URL
        let canonicalUrl: string
        try {
            const u = new URL(item.link)
            // Remove tracking params
            const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid']
            paramsToRemove.forEach(p => u.searchParams.delete(p))
            canonicalUrl = u.toString()
        } catch {
            canonicalUrl = item.link
        }

        // Hash
        const hash = crypto.createHash('sha256').update(canonicalUrl).digest('hex')

        // Excerpt
        let excerpt = ""
        const content = item.contentSnippet || item.content || item.summary || ""
        if (content) {
            // HTML strip
            const $ = cheerio.load(content)
            excerpt = $.text().replace(/\s+/g, ' ').trim().slice(0, 240)
        }

        // Date
        const dateStr = item.isoDate || item.pubDate || item['dc:date']
        const pubDate = dateStr ? new Date(dateStr) : new Date()

        items.push({
            title: item.title,
            link: item.link,
            canonicalUrl,
            pubDate,
            excerpt,
            tags: item.categories || [],
            hash
        })
    }

    return items
}
