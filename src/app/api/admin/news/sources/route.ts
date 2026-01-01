
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const sources = await prisma.newsSource.findMany({
        orderBy: { priority: 'desc' }
    })

    return NextResponse.json(sources)
}

export async function POST(req: Request) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    // Validation skipped for brevity, usage of zod recommended
    if (!body.name || !body.feedUrl) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 })
    }

    try {
        const source = await prisma.newsSource.create({
            data: {
                name: body.name,
                type: body.type || "RSS",
                feedUrl: body.feedUrl,
                homepageUrl: body.homepageUrl || "",
                priority: body.priority || 0,
                trustLevel: body.trustLevel || 50
            }
        })
        return NextResponse.json(source)
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 })
    }
}
