import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function AuditPage() {
    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 50,
        include: { user: true }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Dziennik Audytowy</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Ostatnie Akcje</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Użytkownik</TableHead>
                                <TableHead>Akcja</TableHead>
                                <TableHead>Zasób</TableHead>
                                <TableHead>Szczegóły</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log: any) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs">
                                        {format(log.timestamp, "yyyy-MM-dd HH:mm:ss")}
                                    </TableCell>
                                    <TableCell>{log.user?.email || "System"}</TableCell>
                                    <TableCell className="font-bold">{log.action}</TableCell>
                                    <TableCell>{log.resource}</TableCell>
                                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                                        {JSON.stringify(log.details)}
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
