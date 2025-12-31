import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Next.js 16 params promise
) {
    try {
        const session = await auth()
        if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "BACKOFFICE")) {
            return NextResponse.json({ message: "Brak uprawnień" }, { status: 403 })
        }

        const { id } = await params

        // Check if user has related records that prevent deletion (Orders)
        // We do this manually to give a good error message instead of 500
        const orderCount = await prisma.order.count({ where: { userId: id } })

        if (orderCount > 0) {
            return NextResponse.json({
                message: "Nie można usunąć użytkownika, który posiada historię transakcji. Zamiast tego zablokuj konto."
            }, { status: 409 })
        }

        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Użytkownik usunięty" })
    } catch (error) {
        console.error("Delete user error:", error)
        return NextResponse.json({ message: "Błąd podczas usuwania" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "BACKOFFICE")) {
            return NextResponse.json({ message: "Brak uprawnień" }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const { isActive, name, role, organizationName } = body

        // Handle partial updates
        const updateData: any = {}
        if (typeof isActive === 'boolean') updateData.isActive = isActive
        if (name) updateData.name = name
        if (role) updateData.role = role

        // Organization Logic
        if (organizationName) {
            let org = await prisma.organization.findFirst({ where: { name: organizationName } })
            if (!org) {
                org = await prisma.organization.create({
                    data: {
                        name: organizationName,
                        type: role && role.startsWith("CLIENT") ? "CLIENT" : "INTERNAL"
                    }
                })
            }
            updateData.organizationId = org.id
        } else if (organizationName === "") {
            // Explicitly removing organization? Optional requirement, but let's assume empty string means "no org"
            updateData.organizationId = null
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json(user)

    } catch (error) {
        console.error("Update user error:", error)
        return NextResponse.json({ message: "Błąd podczas aktualizacji" }, { status: 500 })
    }
}
