import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnPublicPage =
                nextUrl.pathname === "/" ||
                nextUrl.pathname === "/login" ||
                nextUrl.pathname === "/register" ||
                nextUrl.pathname.startsWith("/api/auth") ||
                nextUrl.pathname.startsWith("/images") ||
                nextUrl.pathname.startsWith("/static")

            if (isOnPublicPage) {
                return true
            }

            if (!isLoggedIn) {
                return false // Redirect unauthenticated users to login page
            }

            return true
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role
                token.id = user.id
                token.organizationId = user.organizationId
                token.termsVersionAccepted = user.termsVersionAccepted
            }
            if (trigger === "update" && session) {
                token.termsVersionAccepted = session.termsVersionAccepted
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as any
                session.user.organizationId = token.organizationId as string
                session.user.termsVersionAccepted = token.termsVersionAccepted as number
            }
            return session
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
