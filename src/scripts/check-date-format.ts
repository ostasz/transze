
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const quotes = await prisma.futuresQuote.findMany({
        where: {
            date: '2025-12-24'
        }
    });
    console.log('Quotes for 2025-12-24:', JSON.stringify(quotes, null, 2));

    const sample = await prisma.futuresQuote.findFirst({
        where: { contract: 'BASE_Y-26' },
        orderBy: { date: 'desc' },
        take: 1
    });
    console.log('Latest BASE_Y-26:', sample);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
