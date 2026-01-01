"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function CreateUserPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        role: "CLIENT_TRADER",
        organizationName: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [inviteLink, setInviteLink] = useState("")

    const [orgs, setOrgs] = useState<any[]>([])

    useEffect(() => {
        fetch("/api/admin/organizations/list")
            .then(res => res.json())
            .then(data => setOrgs(data))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setInviteLink("")

        try {
            const res = await fetch("/api/admin/users/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (res.ok) {
                setInviteLink(data.inviteLink)
            } else {
                alert(data.message || "Błąd tworzenia")
            }
        } catch (err) {
            alert("Błąd serwera")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-primary">Dodaj Użytkownika / Klienta</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Nowy Użytkownik</CardTitle>
                    <CardDescription>
                        Utwórz konto dla pracownika lub klienta. Wygenerowany zostanie link zaproszeniowy.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
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

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Utwórz Konto
                        </Button>
                    </form>

                    {inviteLink && (
                        <div className="mt-6 p-4 bg-muted rounded-md border border-primary/20">
                            <h4 className="font-bold text-primary mb-2">Użytkownik utworzony!</h4>
                            <p className="text-sm mb-2">Przekaż klientowi ten link aktywacyjny:</p>
                            <code className="block p-2 bg-secondary rounded text-xs break-all">
                                {inviteLink}
                            </code>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
