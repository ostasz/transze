
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const params = await props.params
        const body = await req.json()
        const { contractNumber, validTo, allowedProducts, maxMWPerOrder, yearlyLimits, isActive } = body

        console.log("Updating contract:", params.id, body)

        const updated = await prisma.contract.update({
            where: { id: params.id },
            data: {
                contractNumber,
                validTo: validTo ? new Date(validTo) : null,
                allowedProducts,
                maxMWPerOrder: maxMWPerOrder !== null && maxMWPerOrder !== undefined ? Number(maxMWPerOrder) : undefined,
                yearlyLimits,
                isActive: isActive !== undefined ? isActive : undefined
            } as any
        })

        return NextResponse.json(updated)
    } catch (e: any) {
        console.error("Contract update failed:", e)
        return NextResponse.json({ message: "Update failed", error: e.message }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const params = await props.params
        await prisma.contract.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: "Deleted" })
    } catch (e: any) {
        console.error("Contract delete failed:", e)
        return NextResponse.json({ message: "Delete failed", error: e.message }, { status: 500 })
    }
}
