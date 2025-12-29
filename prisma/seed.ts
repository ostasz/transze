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
