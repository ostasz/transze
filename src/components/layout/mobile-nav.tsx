"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, User, LogOut } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function MobileNav() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [userOpen, setUserOpen] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()

    // Map pathname to Title
    const getTitle = () => {
        if (pathname.startsWith("/trading")) return "Handel"
        if (pathname.startsWith("/terminal")) return "Terminal"
        if (pathname.startsWith("/positions")) return "Pozycje"
        if (pathname.startsWith("/futures")) return "Rynek Terminowy"
        if (pathname.startsWith("/rdn2")) return "Rynek Dnia Nastepnego"
        if (pathname.startsWith("/dashboard")) return "Dashboard"
        if (pathname.startsWith("/admin")) return "Administracja"
        return "Ekovoltis"
    }

    const userInitials = session?.user?.name ?
        session.user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() :
        session?.user?.email?.substring(0, 2).toUpperCase() || "U"

    return (
        <>
            {/* Top App Bar (Fixed) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-[60px] bg-background/80 backdrop-blur-md border-b">
                {/* Left: Title */}
                <div className="flex items-center">
                    <span className="font-bold text-lg tracking-tight">{getTitle()}</span>
                </div>

                {/* Right: User Avatar Trigger */}
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <Button variant="ghost" size="icon" className="-mr-2 rounded-full" onClick={() => setUserOpen(true)}>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={session?.user?.image || ""} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Profil</span>
                    </Button>
                </div>
            </div>

            {/* Spacer for Top Bar */}
            <div className="h-[60px] lg:hidden" />

            {/* Bottom Nav (Fixed) */}
            <BottomNav onOpenMenu={() => setSidebarOpen(true)} />

            {/* Sidebar Sheet (Left) */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-80 border-r">
                    <SheetTitle className="sr-only">Nawigacja</SheetTitle>
                    <Sidebar className="border-none shadow-none w-full bg-transparent" onNavigate={() => setSidebarOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* User Sheet (Right) */}
            <Sheet open={userOpen} onOpenChange={setUserOpen}>
                <SheetContent side="right" className="w-80 sm:w-[350px]">
                    <SheetTitle className="sr-only">Profil Użytkownika</SheetTitle>
                    <div className="flex flex-col h-full py-6">
                        <div className="flex items-center gap-4 mb-8">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold text-lg">{session?.user?.name || "Użytkownik"}</span>
                                <span className="text-sm text-muted-foreground">{session?.user?.email}</span>
                                <span className="text-xs bg-secondary px-2 py-0.5 rounded mt-1 w-fit">
                                    {session?.user?.role || "GUEST"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <Button variant="destructive" className="w-full justify-start" onClick={() => signOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Wyloguj się
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
