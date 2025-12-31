import { PositionsWidget } from "@/components/trading/positions-widget"

export default function PositionsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Twoje Pozycje</h1>
                <p className="text-muted-foreground">Szczegółowy podgląd otwartych pozycji i limitów.</p>
            </div>

            <div className="max-w-3xl">
                <PositionsWidget />
            </div>
        </div>
    )
}
