"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, FileText, TrendingUp, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
    const pathname = usePathname()

    const tabs = [
        {
            href: "/terminal",
            label: "Terminal",
            icon: LayoutDashboard,
        },
        {
            href: "/trading",
            label: "Handel",
            icon: Briefcase,
        },
        {
            href: "/positions",
            label: "Pozycje",
            icon: FileText,
        },
        {
            href: "/futures",
            label: "Rynek",
            icon: TrendingUp,
        },
    ]

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t pb-safe">
            <div className="flex justify-around items-center h-16 landscape:h-12">
                {tabs.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
                            pathname.startsWith(tab.href)
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium landscape:hidden">{tab.label}</span>
                    </Link>
                ))}

                <button
                    onClick={onOpenMenu}
                    className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform text-muted-foreground hover:text-foreground"
                >
                    <Menu className="h-5 w-5" />
                    <span className="text-[10px] font-medium landscape:hidden">Więcej</span>
                </button>
            </div>
        </div>
    )
}
