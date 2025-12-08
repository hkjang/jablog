import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    log: ['info'],
});
async function main() {
    console.log('Start seeding ...');
    const topic1 = await prisma.topic.upsert({
        where: { name: 'Technology' },
        update: {},
        create: {
            name: 'Technology',
            keywords: {
                create: [
                    { text: 'AI', volume: 1000, competition: 0.8 },
                    { text: 'Blockchain', volume: 500, competition: 0.6 },
                ],
            },
        },
    });
    const topic2 = await prisma.topic.upsert({
        where: { name: 'Health' },
        update: {},
        create: {
            name: 'Health',
            keywords: {
                create: [
                    { text: 'Yoga', volume: 800, competition: 0.5 },
                    { text: 'Meditation', volume: 600, competition: 0.3 },
                ],
            },
        },
    });
    console.log({ topic1, topic2 });
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
