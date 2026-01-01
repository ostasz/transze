
"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Pencil } from "lucide-react"

interface Contract {
    id: string
    contractNumber: string | null
    validTo: string | null
    allowedProducts: string[]
    isActive: boolean
    maxMWPerOrder: number | null
    yearlyLimits: any // simple json type
}

export function EditContractDialog({ contract }: { contract: Contract }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        contractNumber: contract.contractNumber || "",
        validTo: contract.validTo ? new Date(contract.validTo).toISOString().split('T')[0] : "",
        allowedProducts: contract.allowedProducts.join(", "),
        maxMWPerOrder: contract.maxMWPerOrder || 0,
        yearlyLimits: contract.yearlyLimits || {},
        isActive: contract.isActive
    })

    // Helper to infer families from products
    const inferFamilies = (products: string[]) => {
        const families = new Set<string>()
        products.forEach(p => {
            if (p.includes("BASE_Y")) families.add("BASE_Y")
            if (p.includes("PEAK_Y") || p.includes("PEAK5_Y")) families.add("PEAK_Y")
            if (p.includes("BASE_Q")) families.add("BASE_Q")
            if (p.includes("PEAK_Q") || p.includes("PEAK5_Q")) families.add("PEAK_Q")
            if (p.includes("BASE_M")) families.add("BASE_M")
            if (p.includes("PEAK_M") || p.includes("PEAK5_M")) families.add("PEAK_M")
        })
        return Array.from(families)
    }

    const [selectedFamilies, setSelectedFamilies] = useState<string[]>(
        inferFamilies(contract.allowedProducts)
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Generate products based on families and yearly limits
        const generatedProducts: string[] = []

        Object.entries(formData.yearlyLimits).forEach(([year, limit]) => {
            if (Number(limit) > 0) {
                const yy = year.slice(-2)

                if (selectedFamilies.includes("BASE_Y")) generatedProducts.push(`BASE_Y-${yy}`)
                if (selectedFamilies.includes("PEAK_Y")) generatedProducts.push(`PEAK5_Y-${yy}`)

                if (selectedFamilies.includes("BASE_Q")) {
                    [1, 2, 3, 4].forEach(q => generatedProducts.push(`BASE_Q-${q}-${yy}`))
                }
                if (selectedFamilies.includes("PEAK_Q")) {
                    [1, 2, 3, 4].forEach(q => generatedProducts.push(`PEAK5_Q-${q}-${yy}`))
                }

                if (selectedFamilies.includes("BASE_M")) {
                    Array.from({ length: 12 }, (_, i) => i + 1).forEach(m => {
                        const mm = m.toString().padStart(2, '0')
                        generatedProducts.push(`BASE_M-${mm}-${yy}`)
                    })
                }
                if (selectedFamilies.includes("PEAK_M")) {
                    Array.from({ length: 12 }, (_, i) => i + 1).forEach(m => {
                        const mm = m.toString().padStart(2, '0')
                        generatedProducts.push(`PEAK5_M-${mm}-${yy}`)
                    })
                }
            }
        })

        try {
            const res = await fetch(`/api/admin/contracts/${contract.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contractNumber: formData.contractNumber,
                    validTo: formData.validTo ? new Date(formData.validTo).toISOString() : null,
                    allowedProducts: generatedProducts,
                    maxMWPerOrder: Number(formData.maxMWPerOrder),
                    yearlyLimits: formData.yearlyLimits,
                    isActive: formData.isActive
                })
            })

            if (!res.ok) throw new Error("Update failed")

            setOpen(false)
            router.refresh()
        } catch (error) {
            alert("Nieudana aktualizacja umowy")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Czy na pewno chcesz usunąć tę umowę?")) return
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/contracts/${contract.id}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Delete failed")
            setOpen(false)
            router.refresh()
        } catch (error) {
            alert("Nie udało się usunąć umowy")
        } finally {
            setIsLoading(false)
        }
    }

    const toggleFamily = (f: string) => {
        setSelectedFamilies(prev =>
            prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" /> Edytuj
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edycja Umowy</DialogTitle>
                    <DialogDescription>
                        Zmodyfikuj parametry handlowe umowy.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="number" className="text-right">Numer</Label>
                        <Input
                            id="number"
                            className="col-span-3"
                            value={formData.contractNumber}
                            onChange={e => setFormData({ ...formData, contractNumber: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="validTo" className="text-right">Ważna do</Label>
                        <Input
                            id="validTo"
                            type="date"
                            className="col-span-3"
                            value={formData.validTo}
                            onChange={e => setFormData({ ...formData, validTo: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Produkty</Label>
                        <div className="col-span-3 grid grid-cols-2 gap-2">
                            {["BASE_Y", "PEAK_Y", "BASE_Q", "PEAK_Q", "BASE_M", "PEAK_M"].map(family => (
                                <div key={family} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`edit-fam-${family}`}
                                        onCheckedChange={() => toggleFamily(family)}
                                        checked={selectedFamilies.includes(family)}
                                    />
                                    <label htmlFor={`edit-fam-${family}`}>{family}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="limit" className="text-right">Limity Roczne</Label>
                        <div className="col-span-3 grid grid-cols-2 gap-2">
                            {["2026", "2027", "2028", "2029"].map(year => (
                                <Input
                                    key={year}
                                    type="number"
                                    placeholder={year}
                                    value={formData.yearlyLimits[year] || ""}
                                    onChange={e => setFormData({
                                        ...formData,
                                        yearlyLimits: { ...formData.yearlyLimits, [year]: Number(e.target.value) }
                                    })}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Status</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="active"
                                checked={formData.isActive}
                                onCheckedChange={(c) => setFormData({ ...formData, isActive: !!c })}
                            />
                            <label htmlFor="active">Aktywna</label>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            Usuń Umowę
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
