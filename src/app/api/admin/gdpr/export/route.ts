import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // TEMPORARY STUB to unblock Vercel build
    return NextResponse.json({ message: "GDPR Export is currently disabled for maintenance." }, { status: 503 })

    /*
    const session = await auth()
    // access check... role === ADMIN/BACKOFFICE

    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            ordersCreated: true,
            auditLogs: true,
        }
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Return formatted JSON
    return NextResponse.json(user)
    */
}
