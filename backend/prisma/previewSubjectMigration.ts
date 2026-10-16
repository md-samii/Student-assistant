import { PrismaClient } from '@prisma/client';
import { DEFAULT_SUBJECT_CATALOG } from '../src/utils/subjectSeed';

const prisma = new PrismaClient();

const LEGACY_CODE_MAP: Record<string, string> = {
    CS102: 'BPOPS103',
    CS601: 'BCS601',
    CS702: 'BCS703',
};

async function main() {
    const catalogByCode = new Map(
        DEFAULT_SUBJECT_CATALOG.map((item) => [item.code, item]),
    );

    console.log('\n=== SUBJECT MIGRATION PREVIEW (READ ONLY) ===\n');

    for (const [oldCode, newCode] of Object.entries(LEGACY_CODE_MAP)) {
        const oldSubject = await prisma.subject.findUnique({
            where: { code: oldCode },
            include: {
                _count: {
                    select: { resources: true, quizzes: true },
                },
            },
        });

        if (!oldSubject) {
            console.log(`${oldCode}: NOT FOUND — no change`);
            continue;
        }

        const catalogItem = catalogByCode.get(newCode);

        if (!catalogItem) {
            console.log(`${oldCode} -> ${newCode}: TARGET NOT IN CATALOG`);
            continue;
        }

        const target = await prisma.subject.findUnique({
            where: { code: newCode },
        });

        console.log({
            oldCode,
            oldName: oldSubject.name,
            oldId: oldSubject.id,
            resources: oldSubject._count.resources,
            quizzes: oldSubject._count.quizzes,
            proposedCode: newCode,
            proposedName: catalogItem.name,
            targetAlreadyExists: Boolean(target),
            action: target
                ? 'REVIEW REQUIRED — target code already exists'
                : 'POTENTIAL IN-PLACE UPDATE — not executed',
        });
    }
}

main()
    .catch((error) => {
        console.error('Migration preview failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });