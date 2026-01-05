
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth()
    if (!session) return NextResponse.json([], { status: 401 })

    // Check permissions if needed
    // if (session.user.role !== 'ADMIN') ...

    const managers = await prisma.accountManager.findMany({
        include: {
            _count: {
                select: { organizations: true }
            }
        },
        orderBy: { name: 'asc' }
    })
    return NextResponse.json(managers)
}

import { z } from "zod"

const managerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(1),
    mobilePhone: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN" && session?.user?.role !== "BACKOFFICE") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const result = managerSchema.safeParse(body)

        if (!result.success) return NextResponse.json({ message: "Invalid data" }, { status: 400 })

        const { name, email, phone, mobilePhone } = result.data

        const manager = await prisma.accountManager.create({
            data: { name, email, phone, mobilePhone }
        })

        return NextResponse.json(manager, { status: 201 })
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}
