import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { CURRENT_TERMS_VERSION } from "@/lib/constants"

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                termsVersionAccepted: CURRENT_TERMS_VERSION,
                lastTermsAcceptance: new Date(),
            }
        })

        // Log audit
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "TERMS_ACCEPT",
                details: { version: CURRENT_TERMS_VERSION },
                ipAddress: req.headers.get("x-forwarded-for") || "unknown", // Simplified
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Terms accept error:", error)
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}
