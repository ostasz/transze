import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await auth()
    // access check...

    const { email } = await req.json()

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    // Anonymization logic
    const anonEmail = `deleted-${Math.random().toString(36).slice(2)}@anonymized.local`
    const anonName = "User Deleted"

    try {
        await prisma.user.update({
            where: { email },
            data: {
                email: anonEmail,
                name: anonName,
                isActive: false,
                passwordHash: "DELETED",
                // Keep ID intact for foreign keys
            }
        })

        return NextResponse.json({ message: "Użytkownik zanonimizowany pomyślnie" })
    } catch (e) {
        return NextResponse.json({ message: "Błąd" }, { status: 500 })
    }
}
