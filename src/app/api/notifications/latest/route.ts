import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json([], { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const after = searchParams.get("after")

    const notifications = await prisma.notification.findMany({
        where: {
            recipientUserId: session.user.id,
            ...(after ? { createdAt: { gt: new Date(after) } } : {})
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 20
    })

    return NextResponse.json(notifications)
}
