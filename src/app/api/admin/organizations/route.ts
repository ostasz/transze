import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth()
    if (!session) return NextResponse.json([], { status: 401 })

    const orgs = await prisma.organization.findMany()
    return NextResponse.json(orgs)
}

import { z } from "zod"

const orgSchema = z.object({
    name: z.string().min(2),
    nip: z.string().optional(),
    type: z.enum(["CLIENT", "INTERNAL"]),
})

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN" && session?.user?.role !== "BACKOFFICE") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const result = orgSchema.safeParse(body)

        if (!result.success) return NextResponse.json({ message: "Invalid data" }, { status: 400 })

        const { name, nip, type } = result.data

        const org = await prisma.organization.create({
            data: { name, nip, type }
        })

        return NextResponse.json(org, { status: 201 })
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}
