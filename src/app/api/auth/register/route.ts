import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    companyName: z.string().min(2),
    nip: z.string().regex(/^\d{10}$/),
})

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const result = registerSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ message: "Nieprawidłowe dane" }, { status: 400 })
        }

        const { email, password, firstName, lastName, companyName, nip } = result.data

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json({ message: "Użytkownik o tym adresie email już istnieje" }, { status: 409 })
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Find or Create Organization
        // We use upsert logic or find first to link user
        const organization = await prisma.organization.upsert({
            where: { nip },
            update: {}, // If exists, do nothing (or update name?)
            create: {
                name: companyName,
                nip,
                type: 'CLIENT' // Default for external registrations
            }
        })

        // Create user
        await prisma.user.create({
            data: {
                email,
                name: `${firstName} ${lastName}`,
                passwordHash,
                role: "PROSPECT",
                organizationId: organization.id,
                isActive: false,
            },
        })

        // TODO: Send verification email (Mock for now)
        console.log(`[Mock Email] Verification link sent to ${email}`)

        return NextResponse.json({ message: "Konto utworzone. Sprawdź email." }, { status: 201 })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ message: "Wystąpił błąd serwera" }, { status: 500 })
    }
}
