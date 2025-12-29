"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, Download, Trash2 } from "lucide-react"

export default function GDPRPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)
        try {
            // Simplified download trigger
            window.open(`/api/admin/gdpr/export?email=${email}`, "_blank")
        } finally {
            setLoading(false)
        }
    }

    const handleAnonymize = async () => {
        if (!confirm("Czy na pewno chcesz zanonimizować tego użytkownika? TA OPERACJA JEST NIEODWRACALNA.")) return

        setLoading(true)
        try {
            const res = await fetch("/api/admin/gdpr/anonymize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            alert(data.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-primary">Centrum RODO</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Zarządzanie Danymi Użytkownika</CardTitle>
                    <CardDescription>Eksport danych lub prawo do bycia zapomnianym.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Input
                            placeholder="Wpisz email użytkownika..."
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={handleExport} disabled={!email || loading} variant="outline" className="w-1/2">
                            <Download className="mr-2 h-4 w-4" /> Eksport (JSON)
                        </Button>
                        <Button onClick={handleAnonymize} disabled={!email || loading} variant="destructive" className="w-1/2">
                            <Trash2 className="mr-2 h-4 w-4" /> Anonimizacja
                        </Button>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
                        <div>
                            Anonimizacja usuwa dane osobowe (email, nazwisko) zastępując je hashem, ale zachowuje integralność danych transakcyjnych (zlecenia, audyt) zgodnie z wymogami prawnymi (retencja 5 lat).
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
