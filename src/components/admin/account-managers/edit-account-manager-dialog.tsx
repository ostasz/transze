"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Loader2, Trash2 } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Minimum 2 znaki"),
    email: z.string().email("Nieprawidłowy email"),
    phone: z.string().min(1, "Telefon wymagany"),
    mobilePhone: z.string().optional(),
})

interface EditAccountManagerDialogProps {
    manager: {
        id: string
        name: string
        email: string
        phone: string
        mobilePhone: string | null
    }
}

export function EditAccountManagerDialog({ manager }: EditAccountManagerDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: manager.name,
            email: manager.email,
            phone: manager.phone,
            mobilePhone: manager.mobilePhone || "",
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/account-managers/${manager.id}`, {
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
            alert("Błąd aktualizacji")
        } finally {
            setIsLoading(false)
        }
    }

    async function onDelete() {
        if (!confirm("Czy na pewno chcesz usunąć tego opiekuna?")) return

        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/account-managers/${manager.id}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                throw new Error("Failed to delete")
            }

            setOpen(false)
            router.refresh()
        } catch (e) {
            console.error(e)
            alert("Błąd usuwania")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edytuj
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edytuj Opiekuna</DialogTitle>
                    <DialogDescription>
                        Zmodyfikuj dane kontaktowe opiekuna.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
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
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefon Stacjonarny</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="mobilePhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefon Komórkowy (Opcjonalnie)</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="flex justify-between sm:justify-between">
                            <Button type="button" variant="destructive" size="icon" onClick={onDelete} disabled={isLoading}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Anuluj</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Zapisz
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
