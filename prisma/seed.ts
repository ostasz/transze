const { PrismaClient } = require('@prisma/client')
// const bcrypt = require('bcryptjs') // Cannot use require if module type.
// Using dynamic import or mock hash for seed simplicity in CommonJS env issues
// Assuming environment supports it or we use hardcoded hash for 'password123'
// bcrypt hash for 'password123' is '$2a$10$Ep/w.Vj7aVf.tF8LwV.Lw.l/7y.v/7y.v/7y.v/7y.v' (mock)

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Clean up? Optional.

    // 1. Create Organization (Ekovoltis)
    const ekovoltis = await prisma.organization.upsert({
        where: {
            nip: '0000000000'
        },
        update: {},
        create: {
            name: 'Ekovoltis S.A.',
            type: 'INTERNAL',
            nip: '0000000000'
        }
    })

    // 2. Create Admin User
    // Hash for 'admin123'
    // const hash = await bcrypt.hash('admin123', 10) 
    const hash = '$2a$10$CwTycUXWue0Thq9StjUM0ud3v.v.v.v.v.v.v.v.v.v.v' // Mock hash for seed speed/deps

    const admin = await prisma.user.upsert({
        where: { email: 'admin@ekovoltis.pl' },
        update: {},
        create: {
            email: 'admin@ekovoltis.pl',
            name: 'Super Admin',
            passwordHash: hash, // Note: real app needs real hash
            role: 'ADMIN',
            organizationId: ekovoltis.id,
            isActive: true,
            termsVersionAccepted: 1
        }
    })

    // 3. Create Products (Futures)
    const products = [
        { symbol: 'BASE_Y_26', profile: 'BASE', period: 'YEAR', start: '2026-01-01', end: '2026-12-31' },
        { symbol: 'PEAK_Y_26', profile: 'PEAK', period: 'YEAR', start: '2026-01-01', end: '2026-12-31' },
        { symbol: 'BASE_Q3_25', profile: 'BASE', period: 'QUARTER', start: '2025-07-01', end: '2025-09-30' },
        { symbol: 'GAS_Y_26', profile: 'BASE', period: 'YEAR', start: '2026-01-01', end: '2026-10-01' }, // Simplified
    ]

    for (const p of products) {
        await prisma.product.upsert({
            where: { symbol: p.symbol },
            update: {},
            create: {
                symbol: p.symbol,
                profile: p.profile,
                period: p.period,
                deliveryStart: new Date(p.start),
                deliveryEnd: new Date(p.end)
            }
        })
    }

    // 4. Create Quotes (Initial)
    const base26 = await prisma.product.findUnique({ where: { symbol: 'BASE_Y_26' } })
    if (base26) {
        await prisma.quote.create({
            data: {
                symbol: 'BASE_Y_26',
                market: 'TGE',
                price: 450.00,
                timestamp: new Date()
            }
        })
    }

    // 5. Seed News Sources
    const sources = [
        { name: "PSE News", type: "RSS", url: "https://www.pse.pl/home/-/asset_publisher/SYKTI8bIXUBw/rss", home: "https://www.pse.pl", trust: 90, priority: 25 },
        { name: "PSE Komunikaty OSP", type: "RSS", url: "https://www.pse.pl/home/-/asset_publisher/sBY9fi0vULd2/rss", home: "https://www.pse.pl", trust: 100, priority: 40 },
        { name: "URE Aktualności", type: "RSS", url: "https://www.ure.gov.pl/dokumenty/rss/9-rss-424.rss", home: "https://www.ure.gov.pl", trust: 80, priority: 15 },
        { name: "URE REMIT", type: "RSS", url: "https://www.ure.gov.pl/dokumenty/rss/9-rss-729.rss", home: "https://www.ure.gov.pl", trust: 90, priority: 25 },
        { name: "URE Energia Elektr.", type: "RSS", url: "https://www.ure.gov.pl/dokumenty/rss/9-rss-484.rss", home: "https://www.ure.gov.pl", trust: 85, priority: 20 },
        { name: "URE Gaz", type: "RSS", url: "https://www.ure.gov.pl/dokumenty/rss/9-rss-518.rss", home: "https://www.ure.gov.pl", trust: 85, priority: 20 },
        { name: "CIRE Energetyka", type: "RSS", url: "https://www.cire.pl/rss/energetyka.xml", home: "https://www.cire.pl", trust: 60, priority: 10 },
        { name: "CIRE Kraj/Świat", type: "RSS", url: "https://www.cire.pl/rss/kraj-swiat.xml", home: "https://www.cire.pl", trust: 50, priority: 5 },
        { name: "WysokieNapiecie.pl", type: "RSS", url: "https://wysokienapiecie.pl/feed", home: "https://wysokienapiecie.pl", trust: 70, priority: 8 },
        { name: "TGE Aktualności", type: "MANUAL", url: "https://tge.pl/aktualnosci-tge", home: "https://tge.pl", trust: 90, priority: 15 },
    ]

    for (const s of sources) {
        await prisma.newsSource.upsert({
            where: { feedUrl: s.url },
            update: {
                priority: s.priority,
                trustLevel: s.trust
            },
            create: {
                name: s.name,
                type: s.type, // Enum matching
                feedUrl: s.url,
                homepageUrl: s.home,
                trustLevel: s.trust,
                priority: s.priority
            }
        })
    }

    // 6. Seed Core Tags
    const coreTags = [
        "rynek mocy", "DSR", "taryfa", "URE", "PSE", "OZE", "magazyny energii", "ceny energii", "gaz", "węgiel", "ETS", "fotowoltaika", "wiatraki", "atom", "REMIT", "bilansowanie"
    ]

    for (const t of coreTags) {
        // Simple slugify
        const slug = t.toLowerCase().replace(/ /g, '-').replace(/[ąćęłńóśźż]/g, c => ({ 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' })[c] || c)

        await prisma.newsTag.upsert({
            where: { name: t },
            update: {},
            create: {
                name: t,
                slug: slug
            }
        })
    }

    // 7. Initialize default schedule
    await prisma.newsIngestSchedule.create({
        data: {
            mode: "FIXED_TIMES",
            fixedTimesMinutes: [390, 870], // 06:30, 14:30
            timezone: "Europe/Warsaw"
        }
    }).catch(() => { /* Ignore logic if exists, schema doesn't have unique constraint but singleton logic will handle */ })

    console.log('Seeding finished.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
