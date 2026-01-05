import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function FuturesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar className="hidden md:block w-64 shrink-0" />
            <div className="flex-1 flex flex-col h-screen min-w-0">
                <MobileNav />
                <main className="flex-1 bg-[#111827] overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
