import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { z } from "zod"

// Minimal auth config
export const authConfig = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                // TODO: Implement password hashing verification (Argon2/Bcrypt)
                // For MVP structure, we return a mock or real user logic
                // logic will be added when we implement User creation
                const parsed = z.object({ email: z.string().email(), password: z.string() }).safeParse(credentials)
                if (!parsed.success) return null

                const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
                if (!user) return null

                // MOCKED PASSWORD CHECK FOR NOW - Replace with bcrypt comparison
                // if (!match(parsed.data.password, user.passwordHash)) return null

                return user
            },
        }),
    ],
    session: { strategy: "jwt" }, // JWT is easier for Vercel edge/serverless
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
                token.organizationId = user.organizationId
                token.termsVersionAccepted = user.termsVersionAccepted // Add terms version
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as any
                session.user.organizationId = token.organizationId as string
                session.user.termsVersionAccepted = token.termsVersionAccepted as number // Pass to session
            }
            return session
        }
    },
    pages: {
        signIn: '/login', // Custom login page
    }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
