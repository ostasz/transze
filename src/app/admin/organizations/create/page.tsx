"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
    name: z.string().min(2, "Minimum 2 znaki"),
    nip: z.string().min(10, "NIP jest wymagany"),
    type: z.enum(["CLIENT", "INTERNAL"]),
    addressRegistered: z.string().min(1, "Adres siedziby jest wymagany"),
    addressCorrespondence: z.string().min(1, "Adres korespondencyjny jest wymagany"),
    accountManagerId: z.string().min(1, "Wybranie opiekuna jest wymagane"),
})

export default function CreateOrganizationPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [managers, setManagers] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        fetch("/api/admin/account-managers")
            .then(res => res.json())
            .then(data => setManagers(data))
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            nip: "",
            type: "CLIENT",
            addressRegistered: "",
            addressCorrespondence: "",
            accountManagerId: "",
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })

            if (!res.ok) throw new Error("Failed")

            router.push("/admin/organizations")
            router.refresh()
        } catch (e) {
            alert("Błąd tworzenia organizacji")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/admin/organizations" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Powrót do listy
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Nowa Organizacja</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nazwa Organizacji</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Np. Acme Corp Sp. z o.o." />
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
                                            <Input {...field} placeholder="000-000-00-00" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Typ</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CLIENT">Klient</SelectItem>
                                                <SelectItem value="INTERNAL">Wewnętrzna</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <h3 className="col-span-full font-semibold text-sm text-muted-foreground">Dane Adresowe</h3>
                                <FormField
                                    control={form.control}
                                    name="addressRegistered"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Adres Siedziby</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ulica, Miasto, Kod" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="addressCorrespondence"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Adres Korespondencyjny</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Jeśli inny niż siedziby" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <h3 className="col-span-full font-semibold text-sm text-muted-foreground">Opiekun w Ekovoltis</h3>
                                <FormField
                                    control={form.control}
                                    name="accountManagerId"
                                    render={({ field }) => (
                                        <FormItem className="col-span-full">
                                            <FormLabel>Wybierz Opiekuna</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Wybierz opiekuna z listy" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {managers.map(manager => (
                                                        <SelectItem key={manager.id} value={manager.id}>
                                                            {manager.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            <div className="text-xs text-muted-foreground mt-2">
                                                Nie znalazłeś opiekuna? <Link href="/admin/account-managers/create" target="_blank" className="underline hover:text-primary">Dodaj nowego</Link>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Utwórz Organizację
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
