"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Link from "next/link"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    email: z.string().email({ message: "Nieprawidłowy adres email" }),
    password: z.string().min(6, { message: "Hasło musi mieć min. 6 znaków" }),
})

export function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: values.email,
                password: values.password,
            })

            if (result?.error) {
                setError("Błędny email lub hasło")
            } else {
                router.push("/admin") // Default to admin for now, or check role later
                router.refresh()
            }
        } catch (err) {
            setError("Wystąpił błąd logowania")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-primary/10">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                    {/* Logo Placeholder - Ekovoltis Style */}
                    <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                        EV
                    </div>
                </div>
                <CardTitle className="text-2xl text-center font-bold text-primary">Zaloguj się</CardTitle>
                <CardDescription className="text-center">
                    Portal Transzowy Ekovoltis
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="imie.nazwisko@firma.pl" {...field} />
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
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Hasło</FormLabel>
                                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">Zapomniałeś hasła?</Link>
                                    </div>
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
                            Zaloguj się
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center text-muted-foreground">
                    Nie masz konta?{" "}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Zarejestruj się (Prospect)
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
