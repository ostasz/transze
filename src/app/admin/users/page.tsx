import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        include: { organization: true }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">Użytkownicy</h1>
                <Link href="/admin/users/create">
                    <Button>Dodaj Użytkownika</Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-card rounded-md shadow border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Rola</TableHead>
                            <TableHead>Organizacja</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u: any) => (
                            <TableRow key={u.id}>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.role}</TableCell>
                                <TableCell>{u.organization?.name || "-"}</TableCell>
                                <TableCell>{u.isActive ? "Aktywny" : "Nieaktywny"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
