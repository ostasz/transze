
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const specificQuotes = await prisma.futuresQuote.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { date: { contains: '2025-12-23' } },
                        { date: { contains: '23.12.2025' } },
                        { date: { contains: '12/23/2025' } }
                    ]
                },
                {
                    contract: 'BASE_Y-26'
                }
            ]
        },
        take: 5
    });

    console.log(`Found ${specificQuotes.length} quotes for BASE_Y-26 on 23.12`);
    if (specificQuotes.length > 0) {
        console.log('Sample:', specificQuotes[0]);
    } else {
        console.log('No data for BASE_Y-26 on this date.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
