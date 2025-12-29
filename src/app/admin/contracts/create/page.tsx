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
        products: [] as string[]
    })

    useEffect(() => {
        // Fetch orgs
        fetch("/api/admin/organizations").then(res => res.json()).then(data => setOrgs(data))
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await fetch("/api/admin/contracts", {
                method: "POST",
                body: JSON.stringify(formData)
            })
            router.push("/admin/contracts")
        } catch (e) {
            alert("Error")
        } finally {
            setLoading(false)
        }
    }

    const toggleProduct = (p: string) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.includes(p)
                ? prev.products.filter(x => x !== p)
                : [...prev.products, p]
        }))
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
                            <Label>Dozwolone Produkty</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {["BASE_Y_26", "PEAK_Y_26", "GAS_Y_26", "CO2_DEC25"].map(p => (
                                    <div key={p} className="flex items-center space-x-2">
                                        <Checkbox id={`prod-${p}`} onCheckedChange={() => toggleProduct(p)} />
                                        <label htmlFor={`prod-${p}`}>{p}</label>
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
