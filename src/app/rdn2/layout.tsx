import { Sidebar } from "@/components/layout/sidebar"

export default function Rdn2Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-[#F3F4F6] h-screen overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
