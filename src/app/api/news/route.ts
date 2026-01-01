
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get("tag")
    const search = searchParams.get("q")
    const type = searchParams.get("type") // 'top', 'all'

    // Auth optional
    const session = await auth()

    const where: any = {
        isHidden: false
    }

    if (tag) {
        where.tags = {
            some: {
                tag: {
                    name: tag // or slug?
                }
            }
        }
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } }
        ]
    }

    if (type === 'top') {
        where.importance = { gte: 60 }
    }

    // Filter older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    where.publishedAt = {
        gte: thirtyDaysAgo
    }

    try {
        const items = await prisma.newsItem.findMany({
            where,
            orderBy: [
                { isPinned: 'desc' },
                { importance: 'desc' },
                { publishedAt: 'desc' }
            ],
            take: 50,
            include: {
                source: {
                    select: { name: true, type: true }
                },
                tags: {
                    include: { tag: true }
                }
            }
        })

        // Add bookmark info if logged in
        let bookmarkedIds = new Set<string>()
        if (session?.user?.id) {
            const bookmarks = await prisma.newsBookmark.findMany({
                where: {
                    userId: session.user.id,
                    itemId: { in: items.map(i => i.id) }
                },
                select: { itemId: true }
            })
            bookmarks.forEach(b => bookmarkedIds.add(b.itemId))
        }

        const enriched = items.map(item => ({
            ...item,
            isBookmarked: bookmarkedIds.has(item.id),
            tags: item.tags.map(t => t.tag.name)
        }))

        return NextResponse.json(enriched)

    } catch (error: any) {
        console.error("API News Error:", error)
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
    }
}
