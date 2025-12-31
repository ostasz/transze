
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting date repair...");

    // Fetch all quotes with invalid date format (contain newline or AM)
    const quotes = await prisma.futuresQuote.findMany({
        where: {
            date: {
                contains: 'AM'
            }
        },
        select: { id: true, date: true }
    });

    console.log(`Found ${quotes.length} potentially corrupted records.`);

    let fixedCount = 0;
    const updates = [];

    for (const q of quotes) {
        // Pattern: YYYY 12:00:00 AM-DD-\nM
        // Example: "2024 12:00:00 AM-03-\n4" -> Day 03, Month 4, Year 2024
        const regex = /^(\d{4}).*?-(\d{2})-\n(\d{1,2})$/;
        const match = q.date.match(regex);

        if (match) {
            const year = match[1];
            const day = match[2];
            const month = match[3].padStart(2, '0');
            const newDate = `${year}-${month}-${day}`;

            // console.log(`Fixing: "${q.date}" -> "${newDate}"`);

            updates.push(
                prisma.futuresQuote.update({
                    where: { id: q.id },
                    data: { date: newDate }
                })
            );
            fixedCount++;
        }
    }

    if (updates.length > 0) {
        console.log(`Executing ${updates.length} updates...`);
        // Batch in chunks if necessary, but for valid array Promise.all might blow up if too big.
        // Using $transaction might be heavy. Let's do parallel chunks.

        const chunkSize = 100;
        for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize);
            await prisma.$transaction(chunk);
            console.log(`Processed ${i + chunk.length}/${updates.length}`);
        }
    }

    console.log(`Repair complete. Fixed ${fixedCount} records.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
