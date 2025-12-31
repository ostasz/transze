import { UserActions } from "./user-actions"

// ... inside TableHeader (I need to handle this via MULTIPLE chunks or replace whole file, stick to replace logic)

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        include: { organization: true },
        orderBy: { createdAt: 'desc' } // Better sort
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
                            <TableHead className="w-[70px]">Akcje</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u: any) => (
                            <TableRow key={u.id}>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.role}</TableCell>
                                <TableCell>{u.organization?.name || "-"}</TableCell>
                                <TableCell>
                                    <span className={u.isActive ? "text-green-600 font-medium" : "text-gray-500"}>
                                        {u.isActive ? "Aktywny" : "Nieaktywny"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <UserActions user={u} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
