
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const orgUpdateSchema = z.object({
    name: z.string().min(2),
    nip: z.string().min(10),
    type: z.enum(["CLIENT", "INTERNAL"]),
    addressRegistered: z.string().min(1),
    addressCorrespondence: z.string().min(1),
    accountManagerName: z.string().min(1),
    accountManagerPhone: z.string().min(1),
    accountManagerEmail: z.string().email(),
})

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN" && session?.user?.role !== "BACKOFFICE") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const result = orgUpdateSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ message: "Invalid data", errors: result.error.flatten() }, { status: 400 })
        }

        const { name, nip, type, addressRegistered, addressCorrespondence, accountManagerName, accountManagerPhone, accountManagerEmail } = result.data

        // 1. Upsert Account Manager to ensure they exist and have latest details
        const manager = await prisma.accountManager.upsert({
            where: { email: accountManagerEmail },
            update: {
                name: accountManagerName,
                phone: accountManagerPhone
            },
            create: {
                name: accountManagerName,
                email: accountManagerEmail,
                phone: accountManagerPhone
            }
        })

        // 2. Update Organization and connect manager
        const org = await prisma.organization.update({
            where: { id },
            data: {
                name,
                nip,
                type,
                addressRegistered,
                addressCorrespondence,
                accountManagerId: manager.id
            }
        })

        return NextResponse.json(org)
    } catch (e) {
        console.error(e)
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") { // Only ADMIN can delete
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const { id } = await params

        await prisma.organization.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Deleted" })
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}
