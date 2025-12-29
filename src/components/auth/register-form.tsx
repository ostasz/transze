"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Link from "next/link"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    firstName: z.string().min(2, { message: "Imię jest wymagane" }),
    lastName: z.string().min(2, { message: "Nazwisko jest wymagane" }),
    companyName: z.string().min(2, { message: "Nazwa firmy jest wymagana" }),
    nip: z.string().regex(/^\d{10}$/, { message: "NIP musi składać się z 10 cyfr" }),
    email: z.string().email({ message: "Nieprawidłowy adres email" }),
    password: z.string().min(8, { message: "Hasło musi mieć min. 8 znaków" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą się zgadzać",
    path: ["confirmPassword"],
})

export function RegisterForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            companyName: "",
            nip: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Błąd rejestracji")
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-primary/10">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                            EV
                        </div>
                    </div>
                    <CardTitle className="text-center text-primary">Konto utworzone!</CardTitle>
                    <CardDescription className="text-center">
                        Wysłaliśmy link aktywacyjny na Twój adres email. Sprawdź skrzynkę odbiorczą.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Link href="/login">
                        <Button variant="outline">Wróć do logowania</Button>
                    </Link>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-primary/10">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                        EV
                    </div>
                </div>
                <CardTitle className="text-2xl text-center font-bold text-primary">Rejestracja</CardTitle>
                <CardDescription className="text-center">
                    Utwórz konto Prospect, aby uzyskać dostęp do Notowań i Newsów.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Imię</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nazwisko</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Kowalski" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nazwa Firmy</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Firma Sp. z o.o." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nip"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NIP</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1234567890" maxLength={10} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="twoj@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hasło</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Powtórz Hasło</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div className="text-sm text-destructive font-medium text-center bg-destructive/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Zarejestruj się
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center text-muted-foreground">
                    Masz już konto?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Zaloguj się
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
