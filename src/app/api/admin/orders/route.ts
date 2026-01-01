import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.role || !["ADMIN", "TRADER", "BACKOFFICE"].includes(session.user.role)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const orders = await prisma.order.findMany({
            where: {
                status: {
                    in: ["SUBMITTED", "NEEDS_APPROVAL", "PARTIALLY_FILLED"]
                }
            },
            include: {
                organization: {
                    select: { name: true }
                },
                product: {
                    select: { symbol: true }
                },
                createdByUser: {
                    select: { email: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(orders)

    } catch (error) {
        console.error("Admin orders error:", error)
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}
