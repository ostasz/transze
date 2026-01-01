
// Keywords mapping to Tags and Importance Weights
const KEYWORD_RULES: Array<{ tag: string, weight: number, patterns: RegExp[] }> = [
    {
        tag: "awarie",
        weight: 45,
        patterns: [/awari/i, /blackout/i, /stopnie zasilania/i, /ograniczenia/i, /zagrożenie/i, /utraty/i]
    },
    {
        tag: "taryfy",
        weight: 35,
        patterns: [/taryf/i, /stawki/i, /dystrybucja/i, /opłata/i, /rachunk/i]
    },
    {
        tag: "prawo",
        weight: 30,
        patterns: [/ustawa/i, /rozporządzenie/i, /dyrektywa/i, /legislacj/i, /nowelizacj/i, /obowiązki/i]
    },
    {
        tag: "remit",
        weight: 25,
        patterns: [/remit/i, /sankcj/i, /manipulacj/i, /insider/i]
    },
    {
        tag: "rynek-mocy",
        weight: 25,
        patterns: [/rynek mocy/i, /aukcja mocy/i, /obowiązek mocowy/i, /dsr/i, /redukcj/i]
    },
    {
        tag: "csire",
        weight: 25,
        patterns: [/csire/i, /oeb/i, /dane pomiarowe/i, /zmiana sprzedawcy/i]
    },
    {
        tag: "ceny",
        weight: 20,
        patterns: [/ceny/i, /notowania/i, /wzrost cen/i, /spadek cen/i, /indeks/i, /volatility/i, /skok/i]
    },
    {
        tag: "co2",
        weight: 15,
        patterns: [/co2/i, /eua/i, /emisj/i, /klimat/i, /ets/i]
    },
    {
        tag: "gaz",
        weight: 15,
        patterns: [/gaz/i, /lng/i, /błękitne paliwo/i, /magazyny/i, /baltic pipe/i]
    },
    {
        tag: "oze",
        weight: 10,
        patterns: [/oze/i, /fotowoltaik/i, /pv/i, /wiatr/i, /offshore/i, /aukcj/i]
    }
]

const URGENCY_PATTERNS = [/pilne/i, /nadzwyczajne/i, /awaria/i, /blackout/i, /stopnie zasilania/i, /krytyczn/i]
const TIME_SENSITIVE_PATTERNS = [/wchodzi w życie/i, /termin/i, /nowe zasady/i, /iriesp/i, /iriesd/i]

const PENALTY_PATTERNS = [
    { pattern: /konferencj/i, val: 15 },
    { pattern: /zaproszenie/i, val: 15 },
    { pattern: /podsumowanie roku/i, val: 15 },
    { pattern: /webinar/i, val: 15 },
    { pattern: /\?$/, val: 10 } // Clickbait questions
]

export function extractTags(text: string): string[] {
    const rawTags = new Set<string>()

    for (const rule of KEYWORD_RULES) {
        for (const pattern of rule.patterns) {
            if (pattern.test(text)) {
                rawTags.add(rule.tag)
                break // Matched this tag, move to next tag
            }
        }
    }
    return Array.from(rawTags)
}

export function calculateImportance(
    title: string,
    excerpt: string | null,
    sourcePriority: number,
    tags: string[]
): { score: number, breakdown: any } {
    let score = sourcePriority
    const combinedText = (title + " " + (excerpt || "")).toLowerCase()
    const breakdown: any = { source: sourcePriority, tags: 0, urgency: 0, recency: 10, penalties: 0 }

    // Tag summation
    for (const rule of KEYWORD_RULES) {
        if (tags.includes(rule.tag)) {
            score += rule.weight
            breakdown.tags += rule.weight
        }
    }

    // Urgency
    if (URGENCY_PATTERNS.some(p => p.test(combinedText))) {
        score += 20
        breakdown.urgency += 20
    } else if (TIME_SENSITIVE_PATTERNS.some(p => p.test(combinedText))) {
        score += 10
        breakdown.urgency += 10
    }

    // Recency (Initial boost)
    score += 10

    // Penalties
    for (const penalty of PENALTY_PATTERNS) {
        if (penalty.pattern.test(combinedText)) {
            score -= penalty.val
            breakdown.penalties -= penalty.val
        }
    }

    // Clamping
    const finalScore = Math.min(100, Math.max(0, score))
    return { score: finalScore, breakdown }
}
