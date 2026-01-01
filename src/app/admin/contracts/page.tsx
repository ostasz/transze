import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { format } from "date-fns"
import { EditContractDialog } from "@/components/admin/edit-contract-dialog"

export const dynamic = 'force-dynamic'

// Helper to summarize products
function getFamilies(products: string[]) {
    const families = new Set<string>()
    if (products.some(p => p.includes("BASE_Y"))) families.add("BASE_Y")
    if (products.some(p => p.includes("PEAK_Y") || p.includes("PEAK5_Y"))) families.add("PEAK_Y")
    if (products.some(p => p.includes("BASE_Q"))) families.add("BASE_Q")
    if (products.some(p => p.includes("PEAK_Q") || p.includes("PEAK5_Q"))) families.add("PEAK_Q")
    if (products.some(p => p.includes("BASE_M"))) families.add("BASE_M")
    if (products.some(p => p.includes("PEAK_M") || p.includes("PEAK5_M"))) families.add("PEAK_M")
    return Array.from(families)
}

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
                                <TableHead>Limity (MW)</TableHead>
                                <TableHead>Produkty</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contracts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">Brak umów.</TableCell>
                                </TableRow>
                            ) : contracts.map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.contractNumber}</TableCell>
                                    <TableCell>{c.organization?.name}</TableCell>
                                    <TableCell>{format(new Date(c.validTo), "yyyy-MM-dd")}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm">
                                            {c.yearlyLimits && Object.entries(c.yearlyLimits).map(([year, limit]) => (
                                                <span key={year} className="whitespace-nowrap">
                                                    <span className="font-semibold">{year}:</span> {limit as number} MW
                                                </span>
                                            ))}
                                            {(!c.yearlyLimits || Object.keys(c.yearlyLimits).length === 0) && (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {getFamilies(c.allowedProducts).map(f => (
                                                <span key={f} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {c.isActive ? "Aktywna" : "Nieaktywna"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EditContractDialog contract={c} />
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
