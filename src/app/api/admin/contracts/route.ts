import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { organizationId, contractNumber, validFrom, validTo, products, maxMWPerOrder, yearlyLimits } = body

        if (!organizationId) {
            return NextResponse.json({ message: "Organization ID is required" }, { status: 400 })
        }

        console.log("Creating contract with:", body)

        const contract = await prisma.contract.create({
            data: {
                organizationId,
                contractNumber,
                validFrom: validFrom ? new Date(validFrom) : null,
                validTo: validTo ? new Date(validTo) : null,
                allowedProducts: Array.isArray(products) ? products : [],
                maxMWPerOrder: maxMWPerOrder ? Number(maxMWPerOrder) : null,
                yearlyLimits: yearlyLimits || {},
                isActive: true
            } as any
        })

        return NextResponse.json(contract)
    } catch (e: any) {
        console.error("Contract creation failed:", e)
        return NextResponse.json({ message: "Creation failed", error: e.message }, { status: 500 })
    }
}
