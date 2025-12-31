import { Sidebar } from "@/components/layout/sidebar";

export default function FuturesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-gray-50 h-screen overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
