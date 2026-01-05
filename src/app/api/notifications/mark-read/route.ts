import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { ids } = body // Array of notification IDs

    if (!Array.isArray(ids)) {
        // If no IDs provided, maybe mark ALL as read?
        // Or specific logic. Let's support specific IDs for MVP.
        // If empty, mark all unread as read?
        // Let's implement mark specific IDs or "all"
    }

    if (ids && ids.length > 0) {
        await prisma.notification.updateMany({
            where: {
                id: { in: ids },
                recipientUserId: session.user.id
            },
            data: {
                readAt: new Date()
            }
        })
    } else {
        // Mark all as read
        await prisma.notification.updateMany({
            where: {
                recipientUserId: session.user.id,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        })
    }

    return NextResponse.json({ success: true })
}
