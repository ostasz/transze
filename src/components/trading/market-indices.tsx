import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RDNRecord, FuturesRecord } from "@/types/market-data";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";

interface MarketIndicesProps {
    rdnData: RDNRecord[];
    futuresContract?: FuturesRecord | null;
}

export function MarketIndices({ rdnData, futuresContract }: MarketIndicesProps) {
    // Calculate average RDN price for the day
    const avgRdn =
        rdnData.length > 0
            ? rdnData.reduce((acc, curr) => acc + curr.price, 0) / rdnData.length
            : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* RDN Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">TGe24 (RDN)</CardTitle>
                    <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {avgRdn.toLocaleString("pl-PL", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-sm font-normal text-muted-foreground">PLN/MWh</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Średnia z {rdnData.length} godzin dla {rdnData[0]?.date}
                    </p>
                </CardContent>
            </Card>

            {/* Futures Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Futures ({futuresContract?.contract || "BASE_Y-26"})
                    </CardTitle>
                    <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {futuresContract ? (
                        <>
                            <div className="text-2xl font-bold">
                                {futuresContract.DKR?.toLocaleString("pl-PL", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}{" "}
                                <span className="text-sm font-normal text-muted-foreground">PLN/MWh</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Kurs rozliczeniowy z dnia {futuresContract.date}
                            </p>
                        </>
                    ) : (
                        <div className="text-sm text-muted-foreground">Brak danych</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
