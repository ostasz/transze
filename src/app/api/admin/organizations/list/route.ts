
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const orgs = await prisma.organization.findMany({
        select: { id: true, name: true, nip: true },
        orderBy: { name: 'asc' }
    })

    return NextResponse.json(orgs)
}
