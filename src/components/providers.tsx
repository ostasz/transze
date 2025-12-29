"use client"

import { SessionProvider } from "next-auth/react"
import { TermsGuard } from "@/components/auth/terms-guard"


export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <TermsGuard>
                {children}
            </TermsGuard>
        </SessionProvider>
    )
}
