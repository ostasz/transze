"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Ban, CheckCircle, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// AlertDialog unused, using native confirm for simplicity


export function UserActions({ user }: { user: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function toggleStatus() {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !user.isActive })
            })
            if (!res.ok) throw new Error("Status update failed")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Błąd aktualizacji statusu")
        } finally {
            setLoading(false)
        }
    }

    async function deleteUser() {
        if (!confirm("Czy na pewno chcesz trwale usunąć tego użytkownika? Tej operacji nie można cofnąć.")) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "DELETE"
            })
            const data = await res.json()

            if (!res.ok) {
                // Handle 409 conflict (has orders)
                alert(data.message || "Błąd usuwania")
                return
            }

            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Błąd usuwania użytkownika")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                    <span className="sr-only">Otwórz menu</span>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                    Kopiuj ID
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/edit`)}>
                    <span className="flex items-center">✏️ Edytuj</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={toggleStatus}>
                    {user.isActive ? (
                        <>
                            <Ban className="mr-2 h-4 w-4 text-orange-500" />
                            <span>Zablokuj</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span>Aktywuj</span>
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={deleteUser} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Usuń trwale</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
