"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { CURRENT_TERMS_VERSION } from "@/lib/constants"

export function TermsGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (status === "loading") return

        // Allow public routes
        if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/terms") return

        // If user is logged in
        if (session?.user) {
            // Check terms
            const userTerms = session.user.termsVersionAccepted || 0
            if (userTerms < CURRENT_TERMS_VERSION) {
                router.replace("/terms")
            }
        }
    }, [session, status, pathname, router])

    return <>{children}</>
}
