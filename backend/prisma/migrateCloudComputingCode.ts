import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const oldCode = 'CS601';
    const newCode = 'BCS601';

    await prisma.$transaction(async (tx) => {
        const subject = await tx.subject.findUnique({
            where: { code: oldCode },
            include: {
                _count: {
                    select: { resources: true, quizzes: true },
                },
                resources: {
                    where: { title: 'Cloud Computing - Module 1 Notes' },
                    select: {
                        id: true,
                        title: true,
                        _count: {
                            select: { chunks: true },
                        },
                    },
                },
            },
        });

        if (!subject) {
            throw new Error(`Subject ${oldCode} was not found.`);
        }

        if (subject.name !== 'Cloud Computing' || subject.semester !== 6) {
            throw new Error(
                'Subject details do not match the expected Cloud Computing record.',
            );
        }

        if (subject._count.resources !== 2 || subject._count.quizzes !== 0) {
            throw new Error(
                'Unexpected resource or quiz counts. Migration cancelled.',
            );
        }

        const pdf = subject.resources.find(
            (resource) => resource.title === 'Cloud Computing - Module 1 Notes',
        );

        if (!pdf || pdf._count.chunks !== 48) {
            throw new Error(
                'Expected Cloud Computing PDF with 48 chunks was not found.',
            );
        }

        const existingTarget = await tx.subject.findUnique({
            where: { code: newCode },
        });

        if (existingTarget) {
            throw new Error(
                `${newCode} already exists. Migration cancelled to avoid duplicates.`,
            );
        }

        const updated = await tx.subject.update({
            where: { id: subject.id },
            data: { code: newCode },
        });

        console.log('Cloud Computing code updated successfully.');
        console.log({
            id: updated.id,
            oldCode,
            newCode: updated.code,
            name: updated.name,
            semester: updated.semester,
            preservedResourceCount: subject._count.resources,
            preservedPdfChunks: pdf._count.chunks,
        });
    });
}

main()
    .catch((error) => {
        console.error('Cloud Computing migration failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
