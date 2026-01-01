
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateAdvisoryLockIds } from "@/lib/risk-engine"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { status } = body

        // Handle Cancel (status = "CANCELLED")
        if (status === "CANCELLED") {
            return await prisma.$transaction(async (tx) => {
                // Check order ownership and status inside potential lock
                // First get order to know Profile for locking
                const order = await tx.order.findUnique({
                    where: { id },
                    include: { product: true }
                })

                if (!order) {
                    // Throwing an error inside a transaction will cause it to rollback
                    throw new Error("Order not found") // Caught by catch block
                }

                // Verify permissions
                if (order.organizationId !== session.user.organizationId) {
                    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
                }

                // Acquire Lock before changing state that affects exposure
                // Profile heuristic
                const profile = order.product.symbol.includes("PEAK") ? "PEAK" : "BASE"
                const [lockKey1, lockKey2] = generateAdvisoryLockIds(session.user.organizationId!, profile)
                await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey1}::int, ${lockKey2}::int)`

                // Re-check status inside lock if needed (though updates are atomic on row, exposure calc needs serialization)

                const nonCancellable = ["FILLED", "CANCELLED", "REJECTED", "EXPIRED"]
                if (nonCancellable.includes(order.status)) {
                    return NextResponse.json({ message: `Nie można anulować zlecenia o statusie ${order.status}` }, { status: 400 })
                }

                // Execute cancellation
                const updated = await tx.order.update({
                    where: { id },
                    data: { status: "CANCELLED" }
                })

                // Log Audit
                await tx.auditLog.create({
                    data: {
                        userId: session.user.id!,
                        action: "ORDER_CANCEL",
                        resource: `Order:${id}`,
                        details: { oldStatus: order.status, locking: "pg_advisory_xact_lock" }
                    }
                })

                return NextResponse.json(updated)
            })
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 })

    } catch (e: any) { // Explicitly type 'e' as 'any' or 'unknown' and handle
        console.error("Order update error:", e)
        // If an error is thrown inside the transaction (like "Order not found"),
        // it will be caught here.
        if (e.message === "Order not found") {
            return NextResponse.json({ message: e.message }, { status: 404 })
        }
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}
