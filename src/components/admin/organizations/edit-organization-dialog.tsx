"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Loader2 } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Minimum 2 znaki"),
    nip: z.string().min(10, "NIP jest wymagany"),
    type: z.enum(["CLIENT", "INTERNAL"]),
    addressRegistered: z.string().min(1, "Adres siedziby jest wymagany"),
    addressCorrespondence: z.string().min(1, "Adres korespondencyjny jest wymagany"),
    accountManagerName: z.string().min(1, "Imię i nazwisko opiekuna jest wymagane"),
    accountManagerPhone: z.string().min(1, "Telefon opiekuna jest wymagany"),
    accountManagerEmail: z.string().email("Nieprawidłowy format email").min(1, "Email opiekuna jest wymagany"),
})

interface EditOrganizationDialogProps {
    organization: {
        id: string
        name: string
        nip: string | null
        type: "CLIENT" | "INTERNAL"
        addressRegistered: string | null
        addressCorrespondence: string | null
        accountManagerName: string | null
        accountManagerPhone: string | null
        accountManagerEmail: string | null
    }
}

export function EditOrganizationDialog({ organization }: EditOrganizationDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: organization.name,
            nip: organization.nip || "",
            type: organization.type,
            addressRegistered: organization.addressRegistered || "",
            addressCorrespondence: organization.addressCorrespondence || "",
            accountManagerName: organization.accountManagerName || "",
            accountManagerPhone: organization.accountManagerPhone || "",
            accountManagerEmail: organization.accountManagerEmail || "",
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/organizations/${organization.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || "Failed to update")
            }

            setOpen(false)
            router.refresh()
        } catch (e) {
            console.error(e)
            alert("Błąd aktualizacji organizacji")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edytuj
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edytuj Organizację</DialogTitle>
                    <DialogDescription>
                        Zaktualizuj dane organizacji. Wszystkie pola są wymagane.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nazwa Organizacji</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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
                                        <Input {...field} />
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
                                            <Input {...field} />
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
                                            <Input {...field} />
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
                                name="accountManagerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Imię i Nazwisko</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="accountManagerPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefon</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="accountManagerEmail"
                                render={({ field }) => (
                                    <FormItem className="col-span-full md:col-span-1">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Anuluj</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Zapisz Zmiany
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
