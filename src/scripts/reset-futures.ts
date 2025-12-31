
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Deleting all records from FuturesQuote...");
    const { count } = await prisma.futuresQuote.deleteMany({});
    console.log(`Deleted ${count} records.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
