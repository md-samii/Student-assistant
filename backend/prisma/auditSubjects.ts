
import prisma from '../src/config/prisma';

async function main() {
    const subjects = await prisma.subject.findMany({
        orderBy: [{ semester: 'asc' }, { code: 'asc' }],
        include: {
            _count: {
                select: {
                    resources: true,
                    quizzes: true,
                },
            },
            resources: {
                select: {
                    id: true,
                    title: true,
                    driveUrl: true,
                    type: true,
                    _count: {
                        select: {
                            chunks: true,
                        },
                    },
                },
            },
        },
    });

    console.log('\n=== SUBJECT DATABASE AUDIT ===\n');

    for (const subject of subjects) {
        console.log({
            id: subject.id,
            code: subject.code,
            name: subject.name,
            semester: subject.semester,
            resourceCount: subject._count.resources,
            quizCount: subject._count.quizzes,
            resources: subject.resources.map((resource) => ({
                id: resource.id,
                title: resource.title,
                driveUrl: resource.driveUrl,
                type: resource.type,
                chunkCount: resource._count.chunks,
            })),
        });
    }

    console.log(`\nTotal subjects: ${subjects.length}`);
}

main()
    .catch((error) => {
        console.error('Subject audit failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
