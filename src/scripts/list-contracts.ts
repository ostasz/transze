
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const contracts = await prisma.futuresQuote.findMany({
        select: { contract: true },
        distinct: ['contract'],
    });
    console.log("Found Contracts:", contracts.map(c => c.contract));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
