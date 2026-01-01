"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function CreateContractPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [orgs, setOrgs] = useState<any[]>([])

    const [formData, setFormData] = useState({
        organizationId: "",
        contractNumber: "",
        validFrom: "",
        validTo: "",
        products: [] as string[],
        yearlyLimits: {} as Record<string, number>,
    })

    const [selectedFamilies, setSelectedFamilies] = useState<string[]>([])

    useEffect(() => {
        // Fetch orgs
        fetch("/api/admin/organizations").then(res => res.json()).then(data => setOrgs(data))
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

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
            await fetch("/api/admin/contracts", {
                method: "POST",
                body: JSON.stringify({ ...formData, products: generatedProducts })
            })
            router.push("/admin/contracts")
        } catch (e) {
            alert("Error")
        } finally {
            setLoading(false)
        }
    }

    const toggleFamily = (f: string) => {
        setSelectedFamilies(prev =>
            prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Nowa Umowa</h1>
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <Label>Organizacja</Label>
                            <Select onValueChange={v => setFormData({ ...formData, organizationId: v })}>
                                <SelectTrigger><SelectValue placeholder="Wybierz..." /></SelectTrigger>
                                <SelectContent>
                                    {orgs.map(o => (
                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Numer Umowy</Label>
                            <Input value={formData.contractNumber} onChange={e => setFormData({ ...formData, contractNumber: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Ważna od</Label>
                                <Input type="date" onChange={e => setFormData({ ...formData, validFrom: e.target.value })} />
                            </div>
                            <div>
                                <Label>Ważna do</Label>
                                <Input type="date" onChange={e => setFormData({ ...formData, validTo: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <Label>Limity Roczne (MW)</Label>
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                {["2026", "2027", "2028", "2029"].map(year => (
                                    <div key={year}>
                                        <Label className="text-xs text-muted-foreground">Rok {year}</Label>
                                        <Input
                                            type="number"
                                            placeholder="Limit"
                                            value={(formData.yearlyLimits as any)?.[year] || ""}
                                            onChange={e => setFormData({
                                                ...formData,
                                                yearlyLimits: { ...formData.yearlyLimits, [year]: Number(e.target.value) }
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Dozwolone Typy Produktów</Label>
                            <p className="text-xs text-muted-foreground mb-2">Zaznacz typy, które będą dostępne dla lat z ustawionym limitem &gt; 0.</p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {["BASE_Y", "PEAK_Y", "BASE_Q", "PEAK_Q", "BASE_M", "PEAK_M"].map(family => (
                                    <div key={family} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`fam-${family}`}
                                            onCheckedChange={() => toggleFamily(family)}
                                            checked={selectedFamilies.includes(family)}
                                        />
                                        <label htmlFor={`fam-${family}`}>{family}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">Utwórz Umowę</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
