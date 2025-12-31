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
