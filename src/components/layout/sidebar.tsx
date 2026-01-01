"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    LineChart,
    Newspaper,
    Settings,
    LogOut,
    FileText,
    Briefcase,
    TrendingUp,
    ClipboardCheck
} from "lucide-react"

export function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const role = session?.user?.role || "GUEST"

    const links = [
        {
            href: "/terminal",
            label: "Terminal",
            icon: LineChart,
            roles: ["PROSPECT", "CLIENT_ADMIN", "CLIENT_TRADER", "CLIENT_VIEWER", "ADMIN", "BACKOFFICE", "TRADER", "RISK"],
        },
        {
            href: "/rdn2",
            label: "Analiza RDN",
            icon: Newspaper,
            roles: ["CLIENT_ADMIN", "CLIENT_TRADER", "CLIENT_VIEWER", "ADMIN", "BACKOFFICE", "TRADER", "RISK", "PROSPECT"],
        },
        {
            href: "/futures",
            label: "Rynek Terminowy",
            icon: TrendingUp,
            roles: ["CLIENT_ADMIN", "CLIENT_TRADER", "CLIENT_VIEWER", "ADMIN", "BACKOFFICE", "TRADER", "RISK", "PROSPECT"],
        },
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            roles: ["CLIENT_ADMIN", "CLIENT_TRADER", "CLIENT_VIEWER"],
        },
        {
            href: "/trading",
            label: "Handel",
            icon: Briefcase,
            roles: ["CLIENT_ADMIN", "CLIENT_TRADER"],
        },
        {
            href: "/positions",
            label: "Pozycje",
            icon: FileText,
            roles: ["CLIENT_ADMIN", "CLIENT_TRADER", "CLIENT_VIEWER"],
        },
        {
            href: "/admin/orders",
            label: "Trade Desk",
            icon: ClipboardCheck,
            roles: ["ADMIN", "BACKOFFICE", "TRADER"],
        },
        {
            href: "/admin",
            label: "Administracja",
            icon: Settings,
            roles: ["ADMIN", "BACKOFFICE"],
        },
    ]

    const filteredLinks = links.filter((link) => link.roles.includes(role))

    return (
        <div className="pb-12 w-64 border-r min-h-screen bg-card hidden md:block">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary">
                        Ekovoltis Transze
                    </h2>
                    <div className="space-y-1">
                        {filteredLinks.map((link) => (
                            <Button
                                key={link.href}
                                variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                                className={cn("w-full justify-start", pathname.startsWith(link.href) && "bg-secondary")}
                                asChild
                            >
                                <Link href={link.href}>
                                    <link.icon className="mr-2 h-4 w-4" />
                                    {link.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="px-3 py-2 border-t absolute bottom-0 w-64">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{session?.user?.email}</span>
                        <span className="text-xs text-muted-foreground">{role}</span>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Wyloguj
                </Button>
            </div>
        </div>
    )
}
