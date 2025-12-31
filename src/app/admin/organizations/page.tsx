import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Plus, Building2 } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function OrganizationsPage() {
    const orgs = await prisma.organization.findMany({
        include: {
            _count: { select: { users: true } },
            contract: { select: { id: true, isActive: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Organizacje</h1>
                <Link href="/admin/organizations/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nowa Organizacja
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Lista Organizacji
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nazwa</TableHead>
                                <TableHead>NIP</TableHead>
                                <TableHead>Typ</TableHead>
                                <TableHead>Użytkownicy</TableHead>
                                <TableHead>Status Umowy</TableHead>
                                <TableHead className="text-right">Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orgs.map((org) => (
                                <TableRow key={org.id}>
                                    <TableCell className="font-medium">{org.name}</TableCell>
                                    <TableCell>{org.nip || "-"}</TableCell>
                                    <TableCell>{org.type}</TableCell>
                                    <TableCell>{org._count.users}</TableCell>
                                    <TableCell>
                                        {org.contract ? (
                                            <span className={org.contract.isActive ? "text-green-600" : "text-red-500"}>
                                                {org.contract.isActive ? "Aktywna" : "Nieaktywna"}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">Brak</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/organizations/${org.id}`}>
                                            <Button variant="outline" size="sm">Zarządzaj</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
