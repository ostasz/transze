import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full overflow-x-hidden">
            <aside className="hidden lg:block w-64 shrink-0 border-r bg-card">
                <Sidebar />
            </aside>

            <main className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-950 overflow-x-hidden flex flex-col">
                <MobileNav />
                <div className="w-full min-w-0 p-0 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
