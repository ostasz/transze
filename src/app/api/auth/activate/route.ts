import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { token, email, password } = await req.json()

        if (!token || !email || !password) {
            return NextResponse.json({ message: "Brakujące dane" }, { status: 400 })
        }

        // 1. Verify token
        // We use finding by token primarily as it is unique
        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                token: token
            }
        })

        if (!verificationToken) {
            return NextResponse.json({ message: "Nieprawidłowy link aktywacyjny" }, { status: 400 })
        }

        if (verificationToken.identifier !== email) {
            return NextResponse.json({ message: "Nieprawidłowy email dla tego tokenu" }, { status: 400 })
        }

        if (new Date() > verificationToken.expires) {
            return NextResponse.json({ message: "Link aktywacyjny wygasł" }, { status: 400 })
        }

        // 2. Hash Password
        const passwordHash = await bcrypt.hash(password, 10)

        // 3. Update User
        await prisma.user.update({
            where: { email },
            data: {
                passwordHash,
                isActive: true,
                emailVerified: new Date()
            }
        })

        // 4. Delete Token
        await prisma.verificationToken.delete({
            where: { token }
        })

        return NextResponse.json({ message: "Konto aktywowane pomyślnie" })

    } catch (error) {
        console.error("Activation error:", error)
        return NextResponse.json({ message: "Wystąpił błąd podczas aktywacji konta" }, { status: 500 })
    }
}
