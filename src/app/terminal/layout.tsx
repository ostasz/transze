import { Sidebar } from "@/components/layout/sidebar"

export default function TerminalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-gray-50 dark:bg-gray-950 p-6">
                {children}
            </main>
        </div>
    )
}
