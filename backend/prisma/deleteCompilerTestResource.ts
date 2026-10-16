
import prisma from '../src/config/prisma';

const TEST_RESOURCE_ID =
    '169506ac-e202-4caf-9e70-d44a98958b31';

async function main() {
    const resource = await prisma.studyResource.findUnique({
        where: { id: TEST_RESOURCE_ID },
        select: {
            id: true,
            title: true,
            subject: { select: { code: true, name: true } },
            moduleNumber: true,
            _count: { select: { chunks: true } },
        },
    });

    if (!resource) {
        console.log('Test resource not found. Nothing to delete.');
        return;
    }

    if (
        resource.title !== 'Compiler Design - Test Notes' ||
        resource.subject.code !== 'BCS601' ||
        resource._count.chunks !== 0
    ) {
        throw new Error(
            'Safety check failed. Resource does not match the expected test record.',
        );
    }

    console.log('Verified test resource:', resource);

    await prisma.studyResource.delete({
        where: { id: TEST_RESOURCE_ID },
    });

    console.log('Deleted the test resource only.');
    console.log('Cloud Computing notes and their chunks were not targeted.');
}

main()
    .catch((error) => {
        console.error('Deletion failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
