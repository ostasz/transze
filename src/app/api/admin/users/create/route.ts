import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from 'uuid' // Or crypto.randomUUID

export async function POST(req: Request) {
    try {
        const session = await auth()
        // RBAC: Only Admin/Backoffice
        // if (!session || ...) 

        const { email, name, role, organizationName } = await req.json()

        // 1. Find or Create Organization
        let orgId = null
        if (organizationName) {
            let org = await prisma.organization.findFirst({ where: { name: organizationName } })
            if (!org) {
                org = await prisma.organization.create({
                    data: {
                        name: organizationName,
                        type: role.startsWith("CLIENT") ? "CLIENT" : "INTERNAL"
                    }
                })
            }
            orgId = org.id
        }

        // 2. Create User
        // temp password
        const tempPassword = Math.random().toString(36).slice(-8)
        const passwordHash = await bcrypt.hash(tempPassword, 10)

        // Create token for link
        const inviteToken = crypto.randomUUID()

        // We store token in VerificationToken or a new field?
        // For MVP we just return the link and assume user uses 'Forgot Password' or we implement specific activation endpoint.
        // Requirement 5.1: "Klient klika link, ustawia hasło i aktywuje konto."

        const user = await prisma.user.create({
            data: {
                email,
                name,
                role,
                passwordHash, // Set temp
                organizationId: orgId,
                isActive: false, // Inactive
            }
        })

        // Store token logic (using VerificationToken table usually)
        // prisma.verificationToken.create(...)

        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/activate?token=${inviteToken}&email=${email}` // Mocked

        // Log Audit
        await prisma.auditLog.create({
            data: {
                userId: session?.user?.id,
                action: "USER_CREATE",
                resource: `User:${user.id}`,
                details: { role, organization: organizationName }
            }
        })

        return NextResponse.json({
            message: "Utworzono",
            userId: user.id,
            inviteLink
        }, { status: 201 })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Błąd serwera" }, { status: 500 })
    }
}
