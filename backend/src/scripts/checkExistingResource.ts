
import prisma from '../config/prisma';

async function main() {
    const resources = await prisma.studyResource.findMany({
        select: {
            id: true,
            title: true,
            moduleNumber: true,
            subject: {
                select: {
                    code: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    chunks: true,
                },
            },
        },
        orderBy: [
            { subject: { code: 'asc' } },
            { moduleNumber: 'asc' },
        ],
    });

    console.log('\n=== RESOURCE DATABASE REPORT ===');
    console.log('Total resource records:', resources.length);
    console.log(
        'Resources with zero chunks:',
        resources.filter((r) => r._count.chunks === 0).length,
    );

    console.log('\n=== RESOURCES BY SUBJECT AND MODULE ===');
    console.table(
        resources.map((r) => ({
            subject: r.subject.code,
            module: r.moduleNumber,
            title: r.title,
            chunks: r._count.chunks,
            id: r.id,
        })),
    );

    const totalChunks = resources.reduce(
        (sum, resource) => sum + resource._count.chunks,
        0,
    );

    console.log('\nTotal chunks:', totalChunks);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
