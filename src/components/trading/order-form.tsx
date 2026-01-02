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
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Loader2, ChevronsUpDown, Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"

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
    const [isInstrumentSheetOpen, setInstrumentSheetOpen] = useState(false)

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

        // Listen for instrument selection from Ticker
        const handleInstrumentSelect = (e: any) => {
            const symbol = e.detail
            if (symbol) {
                form.setValue("instrument", symbol)
            }
        }
        window.addEventListener("trading:instrument-select", handleInstrumentSelect)

        return () => {
            window.removeEventListener("trading:instrument-select", handleInstrumentSelect)
        }
    }, [form])

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

            form.reset()
            router.refresh()
            window.dispatchEvent(new Event("trading:update"))
            // Toast success here?
        } catch (e: any) {
            alert(e.message || "Błąd składania zlecenia. Sprawdź poprawność danych.")
        } finally {
            setIsLoading(false)
        }
    }

    const side = form.watch("side")
    const quantity = form.watch("quantity")
    const quantityType = form.watch("quantityType")
    const limitPrice = form.watch("limitPrice")

    return (
        <Card className="border-none shadow-none md:border md:border-primary/20 md:shadow-md bg-transparent md:bg-card p-0 md:p-6">
            <CardHeader className="px-0 pt-0 md:px-6 md:pt-6 hidden md:block">
                <CardTitle className="text-xl text-primary">Nowe Zlecenie</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Segmented Control for Side */}
                        <FormField
                            control={form.control}
                            name="side"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="bg-muted p-1 rounded-lg flex h-10 shadow-inner">
                                        <button
                                            type="button"
                                            onClick={() => field.onChange("BUY")}
                                            className={cn(
                                                "flex-1 rounded-md text-xs font-bold transition-all shadow-sm",
                                                field.value === "BUY"
                                                    ? "bg-background text-green-600 shadow-sm ring-1 ring-black/5"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                            )}
                                        >
                                            KUPNO
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange("SELL")}
                                            className={cn(
                                                "flex-1 rounded-md text-xs font-bold transition-all",
                                                field.value === "SELL"
                                                    ? "bg-background text-red-600 shadow-sm ring-1 ring-black/5"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                            )}
                                        >
                                            SPRZEDAŻ
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Instrument Picker (Sheet Trigger) */}
                        <FormField
                            control={form.control}
                            name="instrument"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-xs">Instrument</FormLabel>
                                    <Sheet open={isInstrumentSheetOpen} onOpenChange={setInstrumentSheetOpen}>
                                        <SheetTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between h-10 text-left bg-background text-sm",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? availableProducts.find(
                                                            (product) => product === field.value
                                                        ) || field.value
                                                        : "Wybierz instrument"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </SheetTrigger>
                                        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
                                            <SheetHeader>
                                                <SheetTitle>Wybierz Instrument</SheetTitle>
                                            </SheetHeader>
                                            <Command>
                                                <CommandInput placeholder="Szukaj instrumentu..." />
                                                <CommandList>
                                                    <CommandEmpty>Nie znaleziono.</CommandEmpty>
                                                    <CommandGroup>
                                                        {availableProducts.map((product) => (
                                                            <CommandItem
                                                                value={product}
                                                                key={product}
                                                                onSelect={() => {
                                                                    form.setValue("instrument", product)
                                                                    setInstrumentSheetOpen(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        product === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {product}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </SheetContent>
                                    </Sheet>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Quantity Row */}
                        <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-12 md:col-span-5">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Ilość</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={e => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}
                                                        className="w-full h-10 text-base"
                                                        placeholder="0.0"
                                                    />
                                                </FormControl>
                                                <FormField
                                                    control={form.control}
                                                    name="quantityType"
                                                    render={({ field }) => (
                                                        <FormItem className="min-w-[90px]">
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-10 text-sm">
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

                            {/* Price & Date Row (Landscape 2 cols, Portrait 1 col) */}
                            <div className="col-span-12 md:col-span-7 grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 gap-3">
                                {/* Price */}
                                <FormField
                                    control={form.control}
                                    name="limitPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Cena (PLN)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={e => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}
                                                    placeholder="0.00"
                                                    className="h-10 text-base"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Valid Until */}
                                <FormField
                                    control={form.control}
                                    name="validUntil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Ważne Do</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    className="text-xs h-10"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Desktop Action Button */}
                        <div className="hidden md:block pt-4">
                            <Button
                                type="submit"
                                className={cn(
                                    "w-full font-bold text-lg h-12 shadow-md",
                                    side === "BUY" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                                )}
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {side === "BUY" ? "Złóż Zlecenie KUPNA" : "Złóż Zlecenie SPRZEDAŻY"}
                            </Button>
                        </div>

                        {/* Mobile Spacer for Sticky Bar */}
                        <div className="md:hidden h-16 w-full" />

                        {/* Mobile Sticky CTA Bar */}
                        <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t p-3 px-4 flex items-center justify-between safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Podsumowanie</span>
                                <div className="flex items-baseline gap-1.5 text-sm whitespace-nowrap">
                                    <span className={cn("font-bold", side === "BUY" ? "text-green-600" : "text-red-600")}>
                                        {side === "BUY" ? "KUP" : "SPRZ"}
                                    </span>
                                    <span className="font-semibold">{quantity || "-"} {quantityType}</span>
                                    <span className="text-muted-foreground font-light">@</span>
                                    <span className="font-semibold">{limitPrice ? `${limitPrice} PLN` : "-"}</span>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isLoading}
                                className={cn(
                                    "px-6 font-bold shadow-sm h-9",
                                    side === "BUY" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                                )}
                            >
                                {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                Złóż
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
