
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProspectCtaCardProps {
    isProspect?: boolean
}

export function ProspectCtaCard({ isProspect = false }: ProspectCtaCardProps) {
    if (!isProspect) return null;

    const lockedFeatures = [
        "Alerty cenowe i powiadomienia SMS",
        "Eksport historycznych danych do Excel",
        "Składanie transz i ofert zakupu",
        "Dostęp do analiz fundamentalnych"
    ];

    return (
        <Card className="border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-900">
                    <Lock className="h-4 w-4" />
                    Tryb podglądu (bez umowy)
                </CardTitle>
                <CardDescription className="text-xs text-amber-800/80">
                    Oglądasz ograniczoną wersję terminala.
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 space-y-3">
                <div className="space-y-2">
                    {lockedFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground opacity-70">
                            <Lock className="h-3 w-3 text-amber-500" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-0">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm" size="sm">
                    Umów demo / Poproś o dostęp
                </Button>
                <Link href="#" className="text-xs text-center text-amber-700 hover:underline hover:text-amber-900 transition-colors">
                    Zobacz różnice Pro vs Podgląd
                </Link>
            </CardFooter>
        </Card>
    );
}
