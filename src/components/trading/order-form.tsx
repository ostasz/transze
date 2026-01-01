"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const orderSchema = z.object({
    instrument: z.string().min(1, "Wybierz produkt"),
    side: z.enum(["BUY", "SELL"]),
    quantityType: z.enum(["MW", "PERCENT"]),
    quantity: z.coerce.number().min(0.1, "Minimum 0.1"),
    limitPrice: z.coerce.number().min(0.01, "Cena wymagana"),
    validUntil: z.string().optional(),
})

export function OrderForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [availableProducts, setAvailableProducts] = useState<string[]>([])
    const [loadingProducts, setLoadingProducts] = useState(true)

    const form = useForm<z.infer<typeof orderSchema>>({
        resolver: zodResolver(orderSchema) as any,
        defaultValues: {
            instrument: "",
            side: "BUY",
            quantityType: "MW",
            quantity: 0,
            limitPrice: 0,
            validUntil: "",
        },
    })

    const router = useRouter()

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/trading/products")
                if (res.ok) {
                    const data = await res.json()
                    setAvailableProducts(data)
                }
            } catch (error) {
                console.error("Failed to fetch products", error)
            } finally {
                setLoadingProducts(false)
            }
        }
        fetchProducts()
    }, [])

    async function onSubmit(values: z.infer<typeof orderSchema>) {
        setIsLoading(true)
        const payload = {
            ...values,
            validUntil: values.validUntil ? new Date(values.validUntil).toISOString() : null
        }

        try {
            const res = await fetch("/api/trading/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const json = await res.json()

            if (!res.ok) throw new Error(json.message || "API Error")

            // Successful submission
            form.reset()
            router.refresh() // Refresh server components (e.g. Orders Table)
            window.dispatchEvent(new Event("trading:update")) // Notify widgets to refetch
        } catch (e: any) {
            alert(e.message || "Błąd składania zlecenia. Sprawdź poprawność danych.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-primary/20 shadow-md">
            <CardHeader>
                <CardTitle className="text-xl text-primary">Nowe Zlecenie</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="instrument"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instrument</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingProducts}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingProducts ? "Ładowanie..." : "Wybierz..."} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableProducts.length > 0 ? availableProducts.map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                )) : (
                                                    <div className="p-2 text-sm text-muted-foreground">Brak dostępnych produktów</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="side"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kierunek</FormLabel>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={field.value === "BUY" ? "default" : "outline"}
                                                onClick={() => field.onChange("BUY")}
                                                className={`w-1/2 ${field.value === "BUY" ? "bg-green-600 hover:bg-green-700" : ""}`}
                                            >
                                                KUPNO
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={field.value === "SELL" ? "default" : "outline"}
                                                onClick={() => field.onChange("SELL")}
                                                className={`w-1/2 ${field.value === "SELL" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                                            >
                                                SPRZEDAŻ
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-5">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ilość / Jednostka</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={e => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}
                                                        className="w-full"
                                                        placeholder="0.0"
                                                    />
                                                </FormControl>
                                                <FormField
                                                    control={form.control}
                                                    name="quantityType"
                                                    render={({ field }) => (
                                                        <FormItem className="min-w-[80px]">
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="MW">MW</SelectItem>
                                                                    <SelectItem value="PERCENT">%</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="col-span-4">
                                <FormField
                                    control={form.control}
                                    name="limitPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cena (PLN/MWh)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={e => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}
                                                    placeholder="0.00"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="col-span-3">
                                <FormField
                                    control={form.control}
                                    name="validUntil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ważne Do</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    className="text-xs"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full font-bold text-lg h-12 mt-4" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Złóż Zlecenie
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
