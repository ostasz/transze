import { QuotesWidget } from "@/components/terminal/quotes-widget"
import { NewsWidget } from "@/components/terminal/news-widget"

export default function TerminalPage() {
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Terminal Rynkowy</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-6">
                {/* Quotes takes up 2/3 */}
                <div className="lg:col-span-2 h-full">
                    <QuotesWidget />
                </div>

                {/* News takes up 1/3 */}
                <div className="lg:col-span-1 h-full">
                    <NewsWidget />
                </div>
            </div>
        </div>
    )
}
