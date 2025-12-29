import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Users, FileText, Shield, Database } from "lucide-react"

export default function AdminDashboard() {
    const cards = [
        { title: "Użytkownicy", desc: "Zarządzaj kontami i rolami", href: "/admin/users", icon: Users },
        { title: "Umowy i Kontrakty", desc: "Definiuj warunki handlowe", href: "/admin/contracts", icon: FileText },
        { title: "Audyt i Bezpieczeństwo", desc: "Przeglądaj logi systemowe", href: "/admin/audit", icon: Shield },
        { title: "Import Danych", desc: "Wgraj notowania (CSV)", href: "/admin/import", icon: Database },
        { title: "RODO / GDPR", desc: "Zarządzanie danymi osobowymi", href: "/admin/gdpr", icon: Shield },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Panel Administratora</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((c) => (
                    <Link key={c.href} href={c.href}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                                <c.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{c.desc}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
