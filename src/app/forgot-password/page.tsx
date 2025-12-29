"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Logic to send reset email via API
        console.log("Reset password for:", email)
        setIsSubmitted(true)
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
                <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-center text-primary">Sprawdź email</CardTitle>
                        <CardDescription className="text-center">
                            Jeśli konto istnieje, wysłaliśmy link do resetowania hasła na <strong>{email}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Link href="/login">
                            <Button variant="outline">Wróć do logowania</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
                <CardHeader>
                    <CardTitle className="text-center text-primary">Reset Hasła</CardTitle>
                    <CardDescription className="text-center">
                        Podaj adres email powiązany z Twoim kontem.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="twoj@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full font-bold">
                            Wyślij link
                        </Button>
                        <div className="text-center text-sm text-muted-foreground mt-4">
                            <Link href="/login" className="text-primary hover:underline">
                                Wróć do logowania
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
