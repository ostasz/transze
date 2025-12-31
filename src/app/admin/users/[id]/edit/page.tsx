import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditUserForm from "./edit-user-form"

export const dynamic = 'force-dynamic'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id },
        include: { organization: true }
    })

    if (!user) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-primary">Edytuj Użytkownika</h1>
            <EditUserForm user={user} />
        </div>
    )
}
