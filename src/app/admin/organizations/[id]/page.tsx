
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, FileText, Users, Pencil, Trash2 } from "lucide-react"
import { EditOrganizationDialog } from "@/components/admin/organizations/edit-organization-dialog"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function OrganizationDetailsPage({ params }: PageProps) {
    const { id } = await params

    const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
            users: true,
            accountManager: true,
            contracts: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!organization) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Link href="/admin/organizations">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            ID: {organization.id}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <EditOrganizationDialog
                        organization={{
                            id: organization.id,
                            name: organization.name,
                            nip: organization.nip,
                            type: organization.type,
                            addressRegistered: organization.addressRegistered,
                            addressCorrespondence: organization.addressCorrespondence,
                            accountManagerName: organization.accountManager?.name ?? null,
                            accountManagerPhone: organization.accountManager?.phone ?? null,
                            accountManagerEmail: organization.accountManager?.email ?? null,
                        }}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Organization Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Szczegóły
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="font-medium text-muted-foreground">Nazwa</div>
                            <div>{organization.name}</div>

                            <div className="font-medium text-muted-foreground">NIP</div>
                            <div>{organization.nip || "-"}</div>

                            <div className="font-medium text-muted-foreground">Typ</div>
                            <div>
                                <Badge variant={organization.type === 'INTERNAL' ? 'default' : 'secondary'}>
                                    {organization.type}
                                </Badge>
                            </div>

                            <div className="font-medium text-muted-foreground">Utworzono</div>
                            <div>{organization.createdAt.toLocaleDateString('pl-PL')}</div>

                            {/* Address Data */}
                            <div className="col-span-2 border-t my-2"></div>
                            <div className="col-span-2 font-semibold text-gray-900">Adresy</div>

                            <div className="font-medium text-muted-foreground">Siedziba</div>
                            <div>{organization.addressRegistered || "-"}</div>

                            <div className="font-medium text-muted-foreground">Korespondencyjny</div>
                            <div>{organization.addressCorrespondence || "-"}</div>

                            {/* Account Manager Data */}
                            <div className="col-span-2 border-t my-2"></div>
                            <div className="col-span-2 font-semibold text-gray-900">Opiekun Ekovoltis</div>

                            <div className="font-medium text-muted-foreground">Imię i Nazwisko</div>
                            <div>{organization.accountManager?.name || "-"}</div>

                            <div className="font-medium text-muted-foreground">Telefon</div>
                            <div>{organization.accountManager?.phone || "-"}</div>

                            <div className="font-medium text-muted-foreground">Email</div>
                            <div>{organization.accountManager?.email || "-"}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contracts Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Umowy
                        </CardTitle>
                        <CardDescription>
                            Aktywne i archiwalne umowy
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {organization.contracts.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Numer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ważność</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {organization.contracts.map(contract => (
                                        <TableRow key={contract.id}>
                                            <TableCell className="font-medium">{contract.contractNumber || "Brak numeru"}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={contract.isActive ? "default" : "destructive"}
                                                    className={contract.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                                                >
                                                    {contract.isActive ? "Aktywna" : "Nieaktywna"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {contract.validTo ? contract.validTo.toLocaleDateString('pl-PL') : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                Brak umów dla tej organizacji
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Użytkownicy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {organization.users.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Imię i Nazwisko</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rola</TableHead>
                                    <TableHead className="text-right">Akcje</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organization.users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name || "-"}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button variant="ghost" size="sm">Szczegóły</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            Brak użytkowników przypisanych do tej organizacji
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
