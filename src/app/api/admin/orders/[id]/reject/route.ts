import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateAdvisoryLockIds } from "@/lib/risk-engine"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id || !["ADMIN", "TRADER", "BACKOFFICE"].includes(session.user.role || "")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { reason } = body

        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id },
                include: { product: true }
            })

            if (!order) {
                throw new Error("Order not found")
            }

            if (!["SUBMITTED", "NEEDS_APPROVAL", "PARTIALLY_FILLED"].includes(order.status)) {
                throw new Error(`Cannot reject order in status ${order.status}`)
            }

            // Lock to ensure state consistency with exposure
            const profile = order.product.symbol.includes("PEAK") ? "PEAK" : "BASE"
            const [lockKey1, lockKey2] = generateAdvisoryLockIds(order.organizationId, profile)
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey1}::int, ${lockKey2}::int)`

            // Kill Remainder Logic: If partially filled, we close it as FILLED (keeping the filled valid), otherwise REJECTED
            const newStatus = order.filledMW > 0 ? "FILLED" : "REJECTED"

            const updated = await tx.order.update({
                where: { id },
                data: { status: newStatus }
            })

            await tx.auditLog.create({
                data: {
                    userId: session.user.id!,
                    action: "ORDER_REJECT",
                    resource: `Order:${id}`,
                    details: { reason }
                }
            })

            return NextResponse.json(updated)
        })

    } catch (e: any) {
        console.error("Reject error:", e)
        return NextResponse.json({ message: e.message || "Server error" }, { status: 500 })
    }
}
