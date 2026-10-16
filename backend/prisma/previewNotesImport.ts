
import fs from 'node:fs';
import path from 'node:path';
import prisma from '../src/config/prisma';

const ROOT = 'C:\\SAMI\\VTU_CSE_Notes_2022';

async function main() {
    const subjects = await prisma.subject.findMany({
        select: {
            id: true,
            code: true,
            name: true,
            semester: true,
            resources: {
                select: {
                    id: true,
                    title: true,
                    moduleNumber: true,
                    type: true,
                    driveUrl: true,
                    _count: { select: { chunks: true } },
                },
            },
        },
    });

    const subjectMap = new Map(
        subjects.map((subject) => [subject.code.toUpperCase(), subject]),
    );

    const seenFiles = new Set<string>();
    const missingSubjects = new Map<string, number>();
    const existingModules: string[] = [];
    const duplicateFiles: string[] = [];
    const importCandidates: string[] = [];
    const invalidFiles: string[] = [];

    let total = 0;

    for (let semester = 1; semester <= 8; semester++) {
        const folder = path.join(ROOT, `Semester_${semester}`);
        if (!fs.existsSync(folder)) continue;

        const files = fs.readdirSync(folder, { recursive: true });

        for (const entry of files) {
            if (typeof entry !== 'string' || !entry.toLowerCase().endsWith('.pdf')) {
                continue;
            }

            const fullPath = path.join(folder, entry);
            const filename = path.basename(entry);
            const match = filename.match(
                /^([A-Za-z0-9]+)-module-(\d+)-pdf\.pdf$/i,
            );

            if (!match) {
                invalidFiles.push(fullPath);
                continue;
            }

            total++;

            const code = match[1].toUpperCase();
            const moduleNumber = Number(match[2]);
            const subject = subjectMap.get(code);

            if (!subject) {
                missingSubjects.set(
                    code,
                    (missingSubjects.get(code) ?? 0) + 1,
                );
                continue;
            }

            const fileKey = `${code}-MODULE-${moduleNumber}`;
            if (seenFiles.has(fileKey)) {
                duplicateFiles.push(fullPath);
                continue;
            }
            seenFiles.add(fileKey);

            const existing = subject.resources.filter(
                (resource) => resource.moduleNumber === moduleNumber,
            );

            if (existing.length > 0) {
                const details = existing
                    .map(
                        (resource) =>
                            `${resource.title} [type=${resource.type}, chunks=${resource._count.chunks}, id=${resource.id}]`,
                    )
                    .join('; ');

                existingModules.push(
                    `${code} Module ${moduleNumber}: ${details}`,
                );
                continue;
            }

            importCandidates.push(
                `${code} | ${subject.name} | Semester ${semester} | Module ${moduleNumber} | ${fullPath}`,
            );
        }
    }

    console.log('\n========== PDF IMPORT DRY RUN ==========');
    console.log(`Recognized PDFs: ${total}`);
    console.log(`Subjects in database: ${subjects.length}`);
    console.log(`Potential import candidates: ${importCandidates.length}`);
    console.log(`Modules with existing resources: ${existingModules.length}`);
    console.log(`Duplicate subject/module files: ${duplicateFiles.length}`);
    console.log(`PDFs with missing subject codes: ${[...missingSubjects.values()].reduce((sum, count) => sum + count, 0)
        }`);
    console.log(`PDFs with unrecognized filenames: ${invalidFiles.length}`);

    console.log('\n--- Existing module resources (NOT overwritten) ---');
    console.log(existingModules.length ? existingModules.join('\n') : 'None');

    console.log('\n--- Missing subject codes ---');
    console.log(
        missingSubjects.size
            ? [...missingSubjects].map(([code, count]) => `${code}: ${count} PDFs`).join('\n')
            : 'None',
    );

    console.log('\n--- Duplicate files ---');
    console.log(duplicateFiles.length ? duplicateFiles.join('\n') : 'None');

    console.log('\n--- Unrecognized filenames ---');
    console.log(invalidFiles.length ? invalidFiles.join('\n') : 'None');

    console.log('\n--- Potential import candidates ---');
    console.log(importCandidates.join('\n') || 'None');

    console.log('\nDRY RUN ONLY: no database records or chunks were changed.');
}

main()
    .catch((error) => {
        console.error('Dry run failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
