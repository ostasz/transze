import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ count: 0 }, { status: 401 })
    }

    const count = await prisma.notification.count({
        where: {
            recipientUserId: session.user.id,
            readAt: null
        }
    })

    return NextResponse.json({ count })
}
