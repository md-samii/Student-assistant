
import prisma from '../config/prisma';

async function main() {
    const resource = await prisma.studyResource.findFirst({
        where: {
            subject: { code: 'BCS503' },
            moduleNumber: 1,
        },
        include: {
            chunks: {
                orderBy: { chunkIndex: 'asc' },
                take: 2,
            },
        },
    });

    if (!resource) {
        console.log('BCS503 Module 1 was not found.');
        return;
    }

    console.log('Resource:', resource.title);
    console.log('Chunk count:', resource.chunks.length);

    for (const chunk of resource.chunks) {
        console.log('\n--- Chunk', chunk.chunkIndex, '---');
        console.log('Text length:', chunk.content.length);
        console.log('Text preview:\n', chunk.content.slice(0, 1500));
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
