import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            organizationId?: string | null
            role: string
            termsVersionAccepted?: number | null
            // role: "ADMIN" | "BACKOFFICE" | "TRADER" | "RISK" | "CLIENT_ADMIN" | "CLIENT_TRADER" | "CLIENT_VIEWER" | "PROSPECT"
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        organizationId?: string | null
        termsVersionAccepted?: number | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        organizationId?: string | null
        termsVersionAccepted?: number | null
    }
}
