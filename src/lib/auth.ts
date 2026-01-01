import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { z } from "zod"
import { authConfig } from "@/auth.config"

// Minimal auth config
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsed = z.object({ email: z.string().email(), password: z.string() }).safeParse(credentials)
                if (!parsed.success) return null

                const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
                if (!user) return null

                // TODO: Implement bcrypt comparison
                // if (!match(parsed.data.password, user.passwordHash)) return null

                return user
            },
        }),
    ],
    session: { strategy: "jwt" },
})


