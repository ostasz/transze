
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const quotes = await prisma.futuresQuote.findMany({
        select: { date: true },
        distinct: ['date'],
        take: 100
    });

    console.log("Unique dates sample:", quotes.map(q => q.date));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
