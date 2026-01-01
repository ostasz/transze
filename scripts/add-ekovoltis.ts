
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Adding Ekovoltis Blog source...")
    const result = await prisma.newsSource.upsert({
        where: { feedUrl: "https://ekovoltis.pl/feed/" },
        update: {},
        create: {
            name: "Ekovoltis Blog",
            type: "RSS",
            feedUrl: "https://ekovoltis.pl/feed/",
            homepageUrl: "https://ekovoltis.pl/blog/",
            trustLevel: 100, // Own source
            priority: 50     // Highest priority
        }
    })
    console.log("Added source:", result.name)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
