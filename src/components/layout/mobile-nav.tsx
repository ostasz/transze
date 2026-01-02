"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"

export function MobileNav() {
    const [open, setOpen] = useState(false)

    return (
        <div className="lg:hidden flex items-center p-4 border-b bg-background">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-r">
                    <SheetTitle className="sr-only">Nawigacja</SheetTitle>
                    <Sidebar className="border-none min-h-full" onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>
            <span className="ml-2 font-semibold">Menu</span>
        </div>
    )
}
