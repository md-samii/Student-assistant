
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UNIVERSITY = 'Visvesvaraya Technological University (VTU)';
const BRANCH = 'Computer Science & Engineering';

const localSubjects = [
    {
        code: 'BPLCK105C',
        name: 'Basics of Java Programming',
        semester: 2,
    },
    {
        code: 'BETCK105H',
        name: 'Introduction to Internet of Things',
        semester: 2,
    },
    {
        code: 'BCS306A',
        name: 'Object Oriented Programming with JAVA',
        semester: 3,
    },
    {
        code: 'BCS306B',
        name: 'OPPS with c++',
        semester: 3,
    },
    {
        code: 'BCSK508',
        name: 'Environmental Studies and E-waste Management',
        semester: 5,
    },
];

async function main() {
    console.log('Checking local subject codes...');

    for (const item of localSubjects) {
        const existing = await prisma.subject.findUnique({
            where: { code: item.code },
        });

        if (existing) {
            console.log(`Already exists: ${item.code} — ${existing.name}`);
            continue;
        }

        await prisma.subject.create({
            data: {
                ...item,
                university: UNIVERSITY,
                branch: BRANCH,
                description: `${item.name} — local VTU CSE notes, Semester ${item.semester}.`,
            },
        });

        console.log(`Created: ${item.code} — ${item.name}`);
    }

    console.log('Local subject check completed.');
}

main()
    .catch((error) => {
        console.error('Failed to add local subjects:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
