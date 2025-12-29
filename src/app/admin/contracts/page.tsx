import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function ContractsPage() {
    const contracts = await prisma.contract.findMany({
        include: { organization: true }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">Umowy i Kontrakty</h1>
                <Link href="/admin/contracts/create">
                    <Button>Nowa Umowa</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Aktywne Umowy</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Numer</TableHead>
                                <TableHead>Organizacja</TableHead>
                                <TableHead>Data Ważności</TableHead>
                                <TableHead>Produkty</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contracts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">Brak umów.</TableCell>
                                </TableRow>
                            ) : contracts.map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell>{c.contractNumber}</TableCell>
                                    <TableCell>{c.organization?.name}</TableCell>
                                    <TableCell>{format(new Date(c.validTo), "yyyy-MM-dd")}</TableCell>
                                    <TableCell>{c.allowedProducts.join(", ")}</TableCell>
                                    <TableCell>{c.isActive ? "Aktywna" : "Wygasła"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
