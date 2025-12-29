"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { CURRENT_TERMS_VERSION } from "@/lib/constants"

export default function TermsPage() {
    const router = useRouter()
    const { data: session, update } = useSession()
    const [accepted, setAccepted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleAccept = async () => {
        if (!accepted) return
        setIsLoading(true)

        try {
            const res = await fetch("/api/user/accept-terms", {
                method: "POST",
            })

            if (res.ok) {
                // Update session client-side to reflect change immediately
                await update({ termsVersionAccepted: CURRENT_TERMS_VERSION })
                router.push("/terminal") // or previous path
                router.refresh()
            } else {
                alert("Wystąpił błąd. Spróbuj ponownie.")
            }
        } catch (err) {
            console.error(err)
            alert("Błąd połączenia.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <Card className="w-full max-w-2xl shadow-lg border-2 border-primary/10">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Regulamin Portalu (v{CURRENT_TERMS_VERSION})</CardTitle>
                    <CardDescription>
                        Przed kontynuowaniem musisz zaakceptować aktualny regulamin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/20 text-sm">
                        <h3 className="font-bold mb-2">1. Postanowienia ogólne</h3>
                        <p className="mb-2">
                            Niniejszy regulamin określa zasady korzystania z Portalu Transzowego Ekovoltis...
                        </p>
                        <h3 className="font-bold mb-2">2. Dostęp i Rejestracja</h3>
                        <p className="mb-2">
                            Dostęp do modułu transakcyjnego przysługuje wyłącznie Klientom posiadającym aktywną Umowę...
                        </p>
                        <h3 className="font-bold mb-2">3. Dane osobowe (RODO)</h3>
                        <p className="mb-2">
                            Administratorem danych jest Ekovoltis. Dane przetwarzane są w celach realizacji usług...
                        </p>
                        <h3 className="font-bold mb-2">4. Odpowiedzialność</h3>
                        <p className="mb-2">
                            Użytkownik ponosi odpowiedzialność za zlecenia składane przy użyciu jego danych logowania...
                        </p>
                        {/* Mock content filler */}
                        <div className="h-40"></div>
                        <p>Koniec regulaminu.</p>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms" checked={accepted} onCheckedChange={(c) => setAccepted(c === true)} />
                        <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Oświadczam, że zapoznałem się z Regulaminem i akceptuję jego postanowienia.
                        </Label>
                    </div>
                    <Button onClick={handleAccept} disabled={!accepted || isLoading} className="w-full font-bold">
                        {isLoading ? "Przetwarzanie..." : "Akceptuję i Przechodzę Dalej"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
