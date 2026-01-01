
import { prisma } from "@/lib/prisma"
import { NewsIngestSchedule, ScheduleMode } from "@prisma/client"
import { addMinutes, format, getMinutes, getHours } from "date-fns"
// Or just rough logic using offset.
// The prompt specifies "Europe/Warsaw".
// I don't have date-fns-tz installed? date-fns v4 has built-in TZ? 
// date-fns v4 supports TZ via helper context orintl.
// Let's assume standard Date handling with implicit execution environment or simple offset calc for now if TZ lib missing.
// I'll check package.json for date-fns-tz. It's not there.
// I will implement a simpler "local time" logic assuming the server is UTC and we add offset for PL (Summer/Winter).
// PL is UTC+1 or UTC+2.

// Lock ID for news ingest
const NEWS_LOCK_ID = 8899776655

export async function tryAcquireLock(): Promise<boolean> {
    const result = await prisma.$queryRaw`SELECT pg_try_advisory_lock(${NEWS_LOCK_ID}) as locked`
    // Result is [{ locked: true/false }]
    // Prisma returns Raw values.
    const row = (result as any[])[0]
    return !!row?.locked
}

export async function releaseLock(): Promise<void> {
    await prisma.$executeRaw`SELECT pg_advisory_unlock(${NEWS_LOCK_ID})`
}

export async function getScheduleDecision(): Promise<{ shouldRun: boolean, reason?: string, schedule?: NewsIngestSchedule }> {
    const schedule = await prisma.newsIngestSchedule.findFirst()
    if (!schedule) {
        return { shouldRun: false, reason: "No schedule config found" }
    }

    if (!schedule.isEnabled) {
        return { shouldRun: false, reason: "Schedule disabled", schedule }
    }

    const now = new Date()

    // Check gap
    if (schedule.lastRunAt) {
        const minutesSinceLast = (now.getTime() - schedule.lastRunAt.getTime()) / 60000
        if (minutesSinceLast < schedule.minGapMinutes) {
            return { shouldRun: false, reason: "Min gap constraint", schedule }
        }
    }

    if (schedule.mode === "INTERVAL") {
        if (!schedule.nextDueAt || now >= schedule.nextDueAt) {
            return { shouldRun: true, reason: "Interval due", schedule }
        }
        return { shouldRun: false, reason: "Not due yet (Interval)", schedule }
    } else {
        // FIXED TIMES
        // Convert 'now' to Target TZ minutes
        // This is tricky without a proper library.
        // Quick hack: Use Vercel's TZ if set, or just UTC+1 default. 
        // Better: Use `Intl` which is standard in Node.
        const plTimeStr = now.toLocaleTimeString("en-GB", { timeZone: schedule.timezone, hour12: false, hour: '2-digit', minute: '2-digit' })
        const [h, m] = plTimeStr.split(':').map(Number)
        const currentMinutes = h * 60 + m

        // Window of +/- 15 minutes (since cron runs every 15 mins)
        // Actually, we want to run IF we are "past" the target time but haven't run explicitly for this "slot".
        // But `lastRunAt` check handles the "already run" part largely.
        // We just need to see if we are inside a valid window.
        // Let's say window is [target, target + 30].

        const isInWindow = schedule.fixedTimesMinutes.some(target => {
            let diff = currentMinutes - target
            // Handle wrap around midnight? Unlikely for news ingest but possible.
            if (diff < 0) diff += 1440

            // Allow if within 0 to 45 mins after target
            return diff >= 0 && diff <= 45
        })

        if (isInWindow) {
            return { shouldRun: true, reason: "Fixed time window match", schedule }
        }

        return { shouldRun: false, reason: "Outside fixed windows", schedule }
    }
}
