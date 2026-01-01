
import { OrderSide } from "@prisma/client"

export type MonthlyExposure = {
    confirmed: number
    pendingBuy: number
    pendingSell: number
}

export type ExposureLedger = Record<string, MonthlyExposure> // Key: "YYYY-MM"

/**
 * Parses a product string into a list of affected months (YYYY-MM).
 */
export function getProductMonths(product: string): string[] {
    // Robust parsing for various standard formats
    // BASE_Y-26, BASE_Q-1-26, BASE_M-01-26, PEAK5_Y-26, etc.

    // Yyyy match
    if (product.includes("_Y-")) {
        const parts = product.split("-")
        const yy = parts[parts.length - 1]
        const year = 2000 + parseInt(yy)
        if (isNaN(year)) return []
        return Array.from({ length: 12 }, (_, i) => {
            return `${year}-${(i + 1).toString().padStart(2, "0")}`
        })
    }

    // Quarter match
    if (product.includes("_Q-")) {
        // e.g. BASE_Q-1-26
        const parts = product.split("-")
        // Assuming format ends with Q-{q}-{yy}
        // Let's use flexible regex or split logic
        // parts: ["BASE_Q", "1", "26"]
        const qStr = parts[parts.length - 2]
        const yyStr = parts[parts.length - 1]
        const q = parseInt(qStr)
        const year = 2000 + parseInt(yyStr)

        if (isNaN(q) || isNaN(year)) return []

        const startMonthIndex = (q - 1) * 3
        return Array.from({ length: 3 }, (_, i) => {
            return `${year}-${(startMonthIndex + i + 1).toString().padStart(2, "0")}`
        })
    }

    // Month match
    if (product.includes("_M-")) {
        // e.g. BASE_M-01-26
        const parts = product.split("-")
        const mmStr = parts[parts.length - 2]
        const yyStr = parts[parts.length - 1]
        const year = 2000 + parseInt(yyStr)

        if (isNaN(year)) return []

        // Ensure mm is 01, 12 etc
        return [`${year}-${mmStr.padStart(2, "0")}`]
    }

    return []
}

export interface RiskOrderInput {
    productId: string
    quantityMW: number
    filledMW?: number
    side: OrderSide
    status: string
}

/**
 * Calculates current exposure explicitly separated into Confirmed, PendingBuy, PendingSell.
 */
export function calculateExposureLedger(orders: RiskOrderInput[]): ExposureLedger {
    const ledger: ExposureLedger = {}

    for (const order of orders) {
        const months = getProductMonths(order.productId)
        if (months.length === 0) continue

        // Status classification
        const isPartiallyFilled = order.status === "PARTIALLY_FILLED"
        const isConfirmedFull = ["FILLED", "APPROVED", "IN_EXECUTION"].includes(order.status)
        const isPendingFull = ["SUBMITTED", "NEEDS_APPROVAL", "PENDING", "DRAFT"].includes(order.status)

        // Ignore CANCELLED, REJECTED, EXPIRED
        if (!isPartiallyFilled && !isConfirmedFull && !isPendingFull) continue

        for (const m of months) {
            if (!ledger[m]) {
                ledger[m] = { confirmed: 0, pendingBuy: 0, pendingSell: 0 }
            }

            if (isPartiallyFilled) {
                // Split logic
                const filledComp = order.filledMW || 0
                const pendingComp = Math.max(0, order.quantityMW - filledComp)
                const sign = order.side === "BUY" ? 1 : -1

                // 1. Confirmed Part
                ledger[m].confirmed += (filledComp * sign)

                // 2. Pending Part
                if (order.side === "BUY") {
                    ledger[m].pendingBuy += pendingComp
                } else {
                    ledger[m].pendingSell += pendingComp
                }

            } else if (isConfirmedFull) {
                // Confirmed affects net position directionally
                const sign = order.side === "BUY" ? 1 : -1
                ledger[m].confirmed += (order.quantityMW * sign)

            } else if (isPendingFull) {
                // Pending is tracked separately by side
                if (order.side === "BUY") {
                    ledger[m].pendingBuy += order.quantityMW
                } else {
                    ledger[m].pendingSell += order.quantityMW
                }
            }
        }
    }

    return ledger
}

export interface RiskValidationResult {
    ok: boolean
    error?: string
}

/**
 * Validates a NEW order against the ledger and limits.
 * RULES:
 * 1. Limit: (Confirmed + PendingBuy) <= Limit
 *    - Pending Sell does NOT release limit (conservative)
 * 2. No Short: (Confirmed - PendingSell - NewSell) >= 0
 *    - Must hold enough confirmed volume to cover all pending sells + new sell
 */
export function validateOrderRisk(
    ledger: ExposureLedger,
    newOrder: { productId: string, quantityMW: number, side: OrderSide },
    yearlyLimits: Record<string, number>
): RiskValidationResult {
    const months = getProductMonths(newOrder.productId)
    if (months.length === 0) return { ok: false, error: "Invalid product period" }

    for (const m of months) {
        const year = m.split("-")[0]
        const limit = yearlyLimits[year] ?? 0 // Default to 0 if no limit set

        const entry = ledger[m] || { confirmed: 0, pendingBuy: 0, pendingSell: 0 }

        if (newOrder.side === "BUY") {
            // Rule 1: Limit Check
            // Usage = Confirmed Net (if positive) + Pending Buy + New Buy
            // Wait, "Confirmed Net" can be negative (short selling is blocked, but technically ledger allows it?)
            // If Confirmed is negative, it reduces usage? 
            // Standard: Usage = (Confirmed + Pending Orders). 
            // But User Rule: "usedForLimit = confirmedNetMw + pendingBuyMw"
            // If confirmedNet is negative (sold), it frees up limit? 
            // Yes, if I bought 10 and sold 5 (confirmed), I have 5 used. 
            // So ConfirmedNet is signed.

            const usedForLimit = entry.confirmed + entry.pendingBuy + newOrder.quantityMW

            if (usedForLimit > limit) {
                return {
                    ok: false,
                    error: `Przekroczono limit w ${m} (Limit: ${limit}, Wykorzystanie: ${usedForLimit.toFixed(1)})`
                }
            }

        } else {
            // Rule 2: No Short Check (SELL)
            // Available = Confirmed - Pending Sells
            // Must be >= New Sell Amount

            const availableToSell = entry.confirmed - entry.pendingSell

            if (availableToSell - newOrder.quantityMW < -0.001) { // Float tolerance
                return {
                    ok: false,
                    error: `Brak pokrycia na sprzedaż w ${m} (Posiadasz: ${availableToSell.toFixed(1)}, Chcesz sprzedać: ${newOrder.quantityMW})`
                }
            }
        }
    }

    return { ok: true }
}

/**
 * Generates two 32-bit integers for Postgres pg_advisory_xact_lock
 * based on Organization ID and Profile.
 */
export function generateAdvisoryLockIds(orgId: string, profile: string): [number, number] {
    // Simple hashing to get consistent integers
    const hashString = (str: string) => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32bit integer
        }
        return hash
    }

    return [hashString(orgId), hashString(profile)]
}
