
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { tryAcquireLock, releaseLock, getScheduleDecision } from "@/lib/news/scheduler"
import { fetchAndParseFeed } from "@/lib/news/fetcher"
import { calculateImportance, extractTags } from "@/lib/news/scoring"

export const dynamic = 'force-dynamic' // Vercel Cron needs this often or static optimization might cache

export async function GET(req: Request) {
    // 1. Auth
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // 2. Lock
    if (!await tryAcquireLock()) {
        return NextResponse.json({ message: "Skipped - Lock held" }, { status: 200 })
    }

    let runId: string | null = null

    try {
        // 3. Schedule Check
        // Bypass schedule check if ?force=true is present (Manual Run)
        const url = new URL(req.url)
        const force = url.searchParams.get("force") === "true"

        let decision: any = { shouldRun: true }
        if (!force) {
            decision = await getScheduleDecision()
            if (!decision.shouldRun) {
                await releaseLock()
                return NextResponse.json({ message: "Skipped", reason: decision.reason }, { status: 200 })
            }
        }

        // Create Run Record
        const run = await prisma.newsIngestRun.create({
            data: {
                status: "RUNNING",
                startedAt: new Date()
            }
        })
        runId = run.id

        // 4. Fetch Sources
        const sources = await prisma.newsSource.findMany({
            where: { isActive: true, type: "RSS" }
        })

        let itemsProcessed = 0
        let sourcesFetched = 0
        let errors = []

        for (const source of sources) {
            try {
                // Check if source interval overrides logic? 
                // For now assuming global schedule triggers, and we fetch all active sources.
                // Could verify 'lastFetchedAt' vs source.fetchIntervalMinutes here.

                if (source.fetchIntervalMinutes && source.lastFetchedAt) {
                    const diff = (Date.now() - source.lastFetchedAt.getTime()) / 60000
                    if (diff < source.fetchIntervalMinutes && !force) continue
                }

                sourcesFetched++

                const fetchedItems = await fetchAndParseFeed(source.feedUrl)

                // Process Items
                for (const raw of fetchedItems) {
                    // Check duplicate by hash
                    const existing = await prisma.newsItem.findUnique({
                        where: { urlHash: raw.hash }
                    })

                    if (existing) continue

                    // Scoring
                    const tags = extractTags(raw.title + " " + raw.excerpt)
                    // Combine with raw tags from feed? usually feed tags are garbage categories, but let's include mapped ones
                    // The feed tags are in 'raw.tags'.

                    const { score } = calculateImportance(
                        raw.title,
                        raw.excerpt,
                        source.priority,
                        tags
                    )

                    // Tags to connect
                    // We need to upsert tags in DB or find them. 
                    // To avoid N+1, ideally we query. But 'NewsTag.upsert' is safe.

                    await prisma.newsItem.create({
                        data: {
                            sourceId: source.id,
                            title: raw.title,
                            url: raw.link,
                            canonicalUrl: raw.canonicalUrl,
                            urlHash: raw.hash,
                            publishedAt: raw.pubDate,
                            fetchedAt: new Date(),
                            excerpt: raw.excerpt,
                            excerptSource: "FEED",
                            importance: score,
                            tags: {
                                create: tags.map(t => ({
                                    tag: {
                                        connectOrCreate: {
                                            where: { name: t },
                                            create: { name: t, slug: t.replace(/\s+/g, '-') } // slug logic duplicated, centralized util better but ok
                                        }
                                    }
                                }))
                            }
                        }
                    })
                    itemsProcessed++
                }

                // Update Source Status
                await prisma.newsSource.update({
                    where: { id: source.id },
                    data: {
                        lastFetchedAt: new Date(),
                        lastFetchStatus: "OK",
                        lastFetchError: null
                    }
                })

            } catch (err: any) {
                errors.push(`${source.name}: ${err.message}`)
                await prisma.newsSource.update({
                    where: { id: source.id },
                    data: {
                        lastFetchedAt: new Date(),
                        lastFetchStatus: "ERROR",
                        lastFetchError: err.message?.substring(0, 200)
                    }
                })
            }
        }

        // Update Run
        await prisma.newsIngestRun.update({
            where: { id: run.id },
            data: {
                finishedAt: new Date(),
                status: errors.length === sources.length && sources.length > 0 ? "ERROR" : "OK", // Partial OK is OK
                itemsProcessed,
                sourcesFetched,
                errorMessage: errors.length > 0 ? errors.join("; ").substring(0, 1000) : null
            }
        })

        // Update Schedule 'lastRunAt' and 'nextDueAt'
        if (decision.schedule) {
            let nextDue: Date | null = null
            if (decision.schedule.mode === "INTERVAL" && decision.schedule.intervalMinutes) {
                nextDue = new Date(Date.now() + decision.schedule.intervalMinutes * 60000)
            }
            // For FIXED_TIMES, we don't strictly need nextDueAt as we check against windows, 
            // but could compute next one for UI display. Omitted for brevity.

            await prisma.newsIngestSchedule.update({
                where: { id: decision.schedule.id },
                data: {
                    lastRunAt: new Date(),
                    nextDueAt: nextDue
                }
            })
        }

        return NextResponse.json({ success: true, processed: itemsProcessed })

    } catch (error: any) {
        if (runId) {
            await prisma.newsIngestRun.update({
                where: { id: runId },
                data: {
                    finishedAt: new Date(),
                    status: "CRASH",
                    errorMessage: error.message
                }
            }).catch(() => { })
        }
        return NextResponse.json({ message: "Internal Error", error: error.message }, { status: 500 })
    } finally {
        await releaseLock()
    }
}
