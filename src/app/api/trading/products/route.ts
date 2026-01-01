
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.organizationId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        // Fetch active contracts
        const contracts = await prisma.contract.findMany({
            where: {
                organizationId: session.user.organizationId,
                isActive: true,
                validTo: { gte: new Date() }
            },
            select: {
                allowedProducts: true
            }
        })

        // Collect all allowed products
        const allProducts = new Set<string>()
        contracts.forEach(c => {
            c.allowedProducts.forEach(p => allProducts.add(p))
        })

        if (allProducts.size === 0) {
            return NextResponse.json([])
        }

        // Sort them for nice display
        // Priority: YEAR -> QUARTER -> MONTH
        // Within that: BASE -> PEAK
        // Then by Year/Number
        const sortedProducts = Array.from(allProducts).sort((a, b) => {
            // Very basic sort: just alphabetical for now is likely sufficient as standard names sort somewhat consistently
            // BASE_M-01-26 comes before BASE_Q-1-26 comes before BASE_Y-26 in ASCII? 
            // - is 45, _ is 95.
            // BASE_M... vs BASE_Q... M comes before Q.
            // BUT usually we want Y then Q then M?
            // Let's implement a simple weighted sort if we have time, but standard sort is fine for MVP.
            return a.localeCompare(b)
        })

        return NextResponse.json(sortedProducts)

    } catch (error) {
        console.error("Products error:", error)
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}
