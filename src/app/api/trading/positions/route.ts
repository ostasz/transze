
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calculateExposureLedger, getProductMonths } from "@/lib/risk-engine"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.organizationId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        // 1. Fetch active contracts to get Yearly Limits
        const contracts = await prisma.contract.findMany({
            where: {
                organizationId: session.user.organizationId,
                isActive: true,
                validTo: { gte: new Date() }
            }
        })

        const yearlyLimits: Record<string, number> = {}
        contracts.forEach(c => {
            const limits = (c as any).yearlyLimits as Record<string, number> | null
            if (limits) {
                Object.entries(limits).forEach(([year, limit]) => {
                    yearlyLimits[year] = (yearlyLimits[year] || 0) + Number(limit)
                })
            }
        })

        // 2. Fetch active orders
        const orders = await prisma.order.findMany({
            where: {
                organizationId: session.user.organizationId,
                status: { in: ["SUBMITTED", "FILLED", "PARTIALLY_FILLED", "APPROVED", "IN_EXECUTION"] }
            },
            include: {
                product: { select: { symbol: true } }
            }
        })

        // If no orders, we still want to return limits
        // if (orders.length === 0 && Object.keys(yearlyLimits).length === 0) {
        //     return NextResponse.json([])
        // }

        // 3. Prepare orders for Risk Engine
        const riskInputs = orders.map(o => ({
            productId: o.product.symbol,
            quantityMW: o.quantityMW || 0,
            filledMW: o.filledMW || 0,
            side: o.side,
            status: o.status
        }))

        // 4. Calculate Ledger (returns { confirmed, pendingBuy, pendingSell } per month)
        const ledger = calculateExposureLedger(riskInputs)

        // 5. Group by Year
        const relevantYears = new Set<string>()
        Object.keys(yearlyLimits).forEach(y => relevantYears.add(y))
        Object.keys(ledger).forEach(m => relevantYears.add(m.split("-")[0]))

        const yearsList = Array.from(relevantYears).sort()

        const responseData = yearsList.map(yearNum => {
            const yearStr = yearNum.toString()
            const limit = yearlyLimits[yearStr] || 0

            // Build 12 months for this year
            const monthsData = []
            let maxUsageInYear = 0

            for (let i = 1; i <= 12; i++) {
                const monthStr = `${yearStr}-${i.toString().padStart(2, '0')}`
                const entry = ledger[monthStr] || { confirmed: 0, pendingBuy: 0, pendingSell: 0 }

                // For Visualization:
                // Confirmed Usage = Confirmed Net (if > 0). If < 0 (short), it doesn't use limit (it's 0 usage or negative).
                // Pending Usage = Pending BUY (uses limit). Check User Req: "pendingBuyMw rezerwuje limit".

                // If confirmed is positive?
                const confirmedUsage = Math.max(0, entry.confirmed)
                const pendingUsage = entry.pendingBuy

                // Total usage for risk/limit bar
                const total = confirmedUsage + pendingUsage

                if (total > maxUsageInYear) {
                    maxUsageInYear = total
                }

                monthsData.push({
                    month: i,
                    monthLabel: i.toString().padStart(2, '0'),
                    confirmed: confirmedUsage,
                    pending: pendingUsage,
                    total
                })
            }

            return {
                year: yearStr,
                limit,
                maxUsage: maxUsageInYear,
                months: monthsData
            }
        })

        return NextResponse.json(responseData)

    } catch (e) {
        console.error("Positions error:", e)
        return NextResponse.json({ message: "Error" }, { status: 500 })
    }
}
