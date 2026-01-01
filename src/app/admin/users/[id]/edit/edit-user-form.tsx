"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function EditUserForm({ user }: { user: any }) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: user.email,
        name: user.name || "",
        role: user.role,
        organizationName: user.organization?.name || "",
    })
    const [isLoading, setIsLoading] = useState(false)

    const [orgs, setOrgs] = useState<any[]>([])

    useEffect(() => {
        fetch("/api/admin/organizations/list")
            .then(res => res.json())
            .then(data => setOrgs(data))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (res.ok) {
                router.push("/admin/users")
                router.refresh()
            } else {
                alert(data.message || "Błąd edycji")
            }
        } catch (err) {
            alert("Błąd serwera")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edycja danych</CardTitle>
                <CardDescription>
                    Zmień dane użytkownika lub przypisz do innej organizacji.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                disabled
                                value={formData.email}
                                className="bg-muted"
                                title="Emailu nie można zmienić"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Imię i Nazwisko</Label>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Rola</Label>
                            <Select
                                value={formData.role}
                                onValueChange={v => setFormData({ ...formData, role: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CLIENT_ADMIN">Client Admin</SelectItem>
                                    <SelectItem value="CLIENT_TRADER">Client Trader</SelectItem>
                                    <SelectItem value="CLIENT_VIEWER">Client Viewer</SelectItem>
                                    <SelectItem value="BACKOFFICE">Backoffice</SelectItem>
                                    <SelectItem value="TRADER">Internal Trader</SelectItem>
                                    <SelectItem value="RISK">Risk/Compliance</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Organizacja</Label>
                            <Select
                                value={formData.organizationName}
                                onValueChange={v => setFormData({ ...formData, organizationName: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz organizację" />
                                </SelectTrigger>
                                <SelectContent>
                                    {orgs.map(org => (
                                        <SelectItem key={org.id} value={org.name}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                            Anuluj
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Zapisz zmiany
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
