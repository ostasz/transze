import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
    const session = await auth()
    // access check...

    const { organizationId, contractNumber, validFrom, validTo, products } = await req.json()

    const contract = await prisma.contract.create({
        data: {
            organizationId,
            contractNumber,
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            allowedProducts: products,
            isActive: true
        }
    })

    return NextResponse.json(contract)
}
