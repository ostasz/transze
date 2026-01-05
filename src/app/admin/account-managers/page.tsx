
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, User, Phone, Smartphone, Mail, Building } from "lucide-react"

// Prism client instance (assuming it's available globally or imported)
import { prisma } from "@/lib/prisma"

export default async function AccountManagersListPage() {
    const managers = await prisma.accountManager.findMany({
        include: {
            _count: {
                select: { organizations: true }
            }
        },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Opiekunowie Ekovoltis</h1>
                    <p className="text-muted-foreground">Zarządzaj opiekunami klientów</p>
                </div>
                <Link href="/admin/account-managers/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj Opiekuna
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista Opiekunów</CardTitle>
                    <CardDescription>
                        {managers.length} opiekunów w systemie
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {managers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Imię i Nazwisko</TableHead>
                                    <TableHead>Kontakt</TableHead>
                                    <TableHead className="text-right">Przypisani Klienci</TableHead>
                                    <TableHead className="text-right">Akcje</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {managers.map((manager) => (
                                    <TableRow key={manager.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {manager.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                {manager.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    {manager.email}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    {manager.phone}
                                                </div>
                                                {manager.mobilePhone && (
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone className="h-3 w-3 text-muted-foreground" />
                                                        {manager.mobilePhone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{manager._count.organizations}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {/* Future: Edit/Delete actions */}
                                            <Button variant="ghost" size="sm" disabled>Szczegóły</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            Brak opiekunów w systemie. Dodaj pierwszego.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
