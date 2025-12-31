"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle } from "lucide-react"

function ActivateForm() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const token = searchParams.get("token")
    const email = searchParams.get("email")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Hasła nie są identyczne")
            return
        }

        if (password.length < 8) {
            setError("Hasło musi mieć minimum 8 znaków")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/auth/activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Błąd aktywacji")
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/login?activated=true")
            }, 2000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!token || !email) {
        return (
            <Card className="w-full max-w-md mx-auto mt-20">
                <CardHeader>
                    <CardTitle className="text-destructive">Nieprawidłowy link</CardTitle>
                    <CardDescription>Link aktywacyjny jest niekompletny.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (success) {
        return (
            <Card className="w-full max-w-md mx-auto mt-20 border-green-500/50 bg-green-500/10">
                <CardContent className="pt-6 text-center space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-green-600">Konto aktywowane!</h2>
                    <p className="text-muted-foreground">Zaraz zostaniesz przekierowany do logowania...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto mt-20">
            <CardHeader>
                <CardTitle>Aktywacja Konta</CardTitle>
                <CardDescription>
                    Witaj <span className="font-medium text-foreground">{email}</span>.<br />
                    Ustaw hasło, aby aktywować dostęp do Ekovoltis Transze.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nowe Hasło</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Min. 8 znaków"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Potwierdź Hasło</Label>
                        <Input
                            id="confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Powtórz hasło"
                        />
                    </div>

                    {error && (
                        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Aktywuj Konto
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function ActivatePage() {
    return (
        <div className="min-h-screen bg-background flex items-start justify-center p-4">
            <Suspense fallback={<div className="mt-20">Ładowanie...</div>}>
                <ActivateForm />
            </Suspense>
        </div>
    )
}
