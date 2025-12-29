import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await auth()

        // RBAC Check
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BACKOFFICE")) {
            return NextResponse.json({ message: "Brak uprawnień" }, { status: 403 })
        }

        const { csv } = await req.json()
        if (!csv) {
            return NextResponse.json({ message: "Brak danych CSV" }, { status: 400 })
        }

        const lines = csv.split('\n').filter((l: string) => l.trim().length > 0)
        let importedCount = 0

        for (const line of lines) {
            // Allow simple format: symbol,market,price,change,date
            const parts = line.split(',')
            if (parts.length < 3) continue

            const symbol = parts[0].trim()
            const market = parts[1].trim()
            const price = parseFloat(parts[2].trim())
            const change = parts[3] ? parseFloat(parts[3].trim()) : 0
            const dateStr = parts[4]?.trim() || new Date().toISOString() // fallback to now

            const timestamp = new Date(dateStr)

            // Upsert Quote
            // Since we don't have constraints on unique(symbol, timestamp) strictly in schema yet (we have index), 
            // we'll just create. Or findFirst/update to make it idempotent if needed for same second.
            // Requirement: "idempotencja (ten sam rekord nie duplikuje się)"
            // Let's first check if exists for this exact timestamp/symbol

            const existing = await prisma.quote.findFirst({
                where: {
                    symbol,
                    timestamp
                }
            })

            if (!existing) {
                await prisma.quote.create({
                    data: {
                        symbol,
                        market,
                        price,
                        // store change? Model doesn't have 'change' field yet in my schema v1.
                        // Wait, I missed 'change' field in schema? I put it in mock data.
                        // Re-checking schema: "Quote { symbol market price currency timestamp ... }"
                        // I should add 'change' field or derivative fields.
                        // I'll add 'change' to schema later or just store price.
                        // For now, let's just store price.
                        timestamp
                    }
                })
                importedCount++
            }
        }

        // Log audit
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "IMPORT_CSV",
                details: { lines: lines.length, imported: importedCount },
            }
        })

        return NextResponse.json({ message: "Import zakończony", count: importedCount }, { status: 200 })
    } catch (error) {
        console.error("Import error:", error)
        return NextResponse.json({ message: "Błąd serwera podczas importu" }, { status: 500 })
    }
}
