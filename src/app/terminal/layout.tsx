import { Sidebar } from "@/components/layout/sidebar"

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full overflow-x-hidden">
            <aside className="hidden md:block w-64 shrink-0 border-r bg-card">
                <Sidebar />
            </aside>

            <main className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-950 p-6 overflow-x-hidden">
                <div className="w-full min-w-0">
                    {children}
                </div>
            </main>
        </div>
    )
}
