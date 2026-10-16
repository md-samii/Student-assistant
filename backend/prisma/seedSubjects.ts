import { PrismaClient } from '@prisma/client';
import { DEFAULT_SUBJECT_CATALOG } from '../src/utils/subjectSeed';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting subject catalog seeding...');

    const seenCodes = new Set<string>();

    for (const item of DEFAULT_SUBJECT_CATALOG) {
        if (seenCodes.has(item.code)) {
            throw new Error(`Duplicate subject code in catalog: ${item.code}`);
        }

        seenCodes.add(item.code);
    }

    let created = 0;
    let alreadyPresent = 0;

    for (const item of DEFAULT_SUBJECT_CATALOG) {
        const existing = await prisma.subject.findUnique({
            where: { code: item.code },
        });

        if (existing) {
            alreadyPresent++;
            console.log(`Skipped existing: ${item.code} — ${existing.name}`);
            continue;
        }

        await prisma.subject.create({
            data: {
                code: item.code,
                name: item.name,
                university: item.university,
                branch: item.branch,
                semester: item.semester,
                description: item.description,
            },
        });

        created++;
        console.log(`Created: ${item.code} — ${item.name}`);
    }

    console.log('\nSubject catalog seeding completed.');
    console.log(`Catalog entries: ${DEFAULT_SUBJECT_CATALOG.length}`);
    console.log(`Created: ${created}`);
    console.log(`Skipped existing: ${alreadyPresent}`);
}

main()
    .catch((error) => {
        console.error('Subject catalog seeding failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });