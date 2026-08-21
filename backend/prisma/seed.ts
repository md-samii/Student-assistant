import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Create Default Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@studentassistant.edu' },
    update: {},
    create: {
      email: 'admin@studentassistant.edu',
      fullName: 'System Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // 2. Create Default Student User
  const studentPasswordHash = await bcrypt.hash('Student@123456', 10);
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@vtu.ac.in' },
    update: {},
    create: {
      email: 'student@vtu.ac.in',
      fullName: 'Rahul Sharma',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isActive: true,
      profile: {
        create: {
          university: 'Visvesvaraya Technological University (VTU)',
          degree: 'Bachelor of Engineering (B.E.)',
          branch: 'Computer Science & Engineering',
          semester: 6,
          graduationYear: 2027,
          phone: '+91 9876543210',
          bio: 'Passionate CS student interested in AI/ML, Full-Stack Web Development, and Cloud Computing.',
          githubUrl: 'https://github.com/rahulsharma-dev',
          linkedinUrl: 'https://linkedin.com/in/rahulsharma-cs',
        },
      },
    },
  });
  console.log('✅ Student user created:', studentUser.email);

  // 3. Create Subjects
  const subjectsData = [
    {
      code: 'CS601',
      name: 'Compiler Design',
      university: 'Visvesvaraya Technological University (VTU)',
      branch: 'Computer Science & Engineering',
      semester: 6,
      description: 'Lexical Analysis, Parsing techniques, Syntax Directed Translation, Intermediate Code Generation, and Code Optimization.',
    },
    {
      code: 'CS602',
      name: 'Artificial Intelligence & Machine Learning',
      university: 'Visvesvaraya Technological University (VTU)',
      branch: 'Computer Science & Engineering',
      semester: 6,
      description: 'Search Algorithms, Knowledge Representation, Supervised & Unsupervised Learning, Decision Trees, and Neural Networks.',
    },
    {
      code: 'CS603',
      name: 'Web Technology & Frameworks',
      university: 'Visvesvaraya Technological University (VTU)',
      branch: 'Computer Science & Engineering',
      semester: 6,
      description: 'HTML5, CSS3, JavaScript ES6+, React.js, Node.js, Express, REST APIs, and Database Integration.',
    },
    {
      code: 'CS604',
      name: 'Cloud Computing & DevOps',
      university: 'Visvesvaraya Technological University (VTU)',
      branch: 'Computer Science & Engineering',
      semester: 6,
      description: 'Cloud Models (AWS/GCP), Virtualization, Containers (Docker), Kubernetes, and CI/CD Pipelines.',
    },
    {
      code: 'IS601',
      name: 'Compiler Design',
      university: 'Visvesvaraya Technological University (VTU)',
      branch: 'Information Science & Engineering',
      semester: 6,
      description: 'Lexical Analysis, Parsing, Syntax Directed Translation, Code Generation, and Optimization.',
    },
    {
      code: 'IS602',
      name: 'Artificial Intelligence & Machine Learning',
      university: 'Visvesvaraya Technological University (VTU)',
      branch: 'Information Science & Engineering',
      semester: 6,
      description: 'Search Algorithms, Supervised & Unsupervised Learning, Decision Trees, and Deep Learning.',
    },
    {
      code: 'IS603',
      name: 'Web Technology & Frameworks',
      university: 'Visvesvaraya Technological University (VTU)',
      branch: 'Information Science & Engineering',
      semester: 6,
      description: 'HTML5, CSS3, Modern JavaScript, React.js, Node.js, Express, and Database Integration.',
    },
  ];

  const createdSubjects = [];
  for (const s of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
    createdSubjects.push(subject);
  }
  console.log(`✅ ${createdSubjects.length} Subjects seeded successfully.`);

  // 4. Create Study Resources (Google Drive Links)
  const driveSampleLinks = [
    'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view',
    'https://drive.google.com/file/d/1c2n9e3_SampleDriveLinkForPDFNotesModule1/view',
    'https://drive.google.com/file/d/1x8v7n2_SampleDriveLinkForPreviousPapers/view',
  ];

  for (const subject of createdSubjects) {
    const resourcesData = [
      {
        title: `${subject.name} - Module 1 Complete Notes (PDF)`,
        description: 'Comprehensive handwritten and typed lecture notes covering core concepts of Module 1.',
        subjectId: subject.id,
        moduleNumber: 1,
        type: 'PDF_NOTES',
        driveUrl: driveSampleLinks[0],
        fileSize: '4.2 MB',
        uploadedBy: adminUser.id,
      },
      {
        title: `${subject.name} - Module 2 Presentation & Slides (PPT)`,
        description: 'Professor presentation slides covering key diagrams, formulas, and architectural charts.',
        subjectId: subject.id,
        moduleNumber: 2,
        type: 'PPT',
        driveUrl: driveSampleLinks[1],
        fileSize: '8.1 MB',
        uploadedBy: adminUser.id,
      },
      {
        title: `${subject.name} - 5-Year Solved Question Papers (2020-2025)`,
        description: 'Previous VTU university exam question papers with detailed step-by-step model solutions.',
        subjectId: subject.id,
        moduleNumber: 3,
        type: 'PREVIOUS_PAPER',
        driveUrl: driveSampleLinks[2],
        fileSize: '12.5 MB',
        uploadedBy: adminUser.id,
      },
      {
        title: `${subject.name} - Practical Lab Manual & Code Examples`,
        description: 'Step-by-step laboratory experiment guide with verified C++/Python/JavaScript code listings.',
        subjectId: subject.id,
        moduleNumber: 4,
        type: 'LAB_MANUAL',
        driveUrl: driveSampleLinks[0],
        fileSize: '3.6 MB',
        uploadedBy: adminUser.id,
      },
    ];

    for (const r of resourcesData) {
      await prisma.studyResource.create({ data: r });
    }
  }
  console.log('✅ Study Resources seeded with Google Drive URLs.');

  // 5. Create Quizzes & Questions
  for (const subject of createdSubjects) {
    const quiz = await prisma.quiz.create({
      data: {
        title: `${subject.name} - Module 1 Practice Quiz`,
        description: `Test your fundamental understanding of ${subject.name} Module 1 concepts. 15 minutes timed assessment.`,
        subjectId: subject.id,
        moduleNumber: 1,
        timeLimitMin: 15,
        totalMarks: 20,
        questions: {
          create: [
            {
              questionText: `Which of the following best describes the primary function of ${subject.name} Module 1?`,
              options: JSON.stringify([
                'Syntax analysis and token generation',
                'Memory allocation and deallocation',
                'Input parsing and representation processing',
                'Hardware interrupt handling',
              ]),
              correctOption: 2,
              explanation: 'Input parsing and structural representation processing form the cornerstone of Module 1 fundamentals.',
            },
            {
              questionText: 'What is the standard time complexity for basic linear search across an array of size N?',
              options: JSON.stringify(['O(1)', 'O(log N)', 'O(N)', 'O(N^2)']),
              correctOption: 2,
              explanation: 'Linear search inspects every element in worst-case order, resulting in O(N) time complexity.',
            },
            {
              questionText: 'Which data structure follows the First-In, First-Out (FIFO) ordering principle?',
              options: JSON.stringify(['Stack', 'Queue', 'Binary Tree', 'Heap']),
              correctOption: 1,
              explanation: 'Queues maintain FIFO ordering where the first element inserted is the first element removed.',
            },
            {
              questionText: 'In modern Web Development, which HTTP method is typically used to update an existing database resource?',
              options: JSON.stringify(['GET', 'POST', 'PUT / PATCH', 'DELETE']),
              correctOption: 2,
              explanation: 'PUT or PATCH HTTP methods are standard RESTful conventions for updating resources.',
            },
          ],
        },
      },
    });
  }
  console.log('✅ Quizzes and Question Banks seeded successfully.');

  // 6. Seed Internships
  const internshipsData = [
    {
      title: 'Software Engineering Intern (Summer 2026)',
      company: 'Google India',
      location: 'Bengaluru / Hybrid',
      stipend: '₹80,000 / month',
      duration: '3 Months',
      applyUrl: 'https://careers.google.com/jobs/results/',
      description: 'Work alongside world-class engineers on scalable distributed systems, algorithms, and cloud infrastructure.',
      deadline: new Date('2026-09-30'),
      status: 'ACTIVE',
    },
    {
      title: 'Full-Stack Web Development Intern',
      company: 'Microsoft',
      location: 'Hyderabad, India',
      stipend: '₹75,000 / month',
      duration: '6 Months',
      applyUrl: 'https://careers.microsoft.com',
      description: 'Build high-performance web interfaces and cloud services using React, TypeScript, Node.js, and Azure.',
      deadline: new Date('2026-10-15'),
      status: 'ACTIVE',
    },
    {
      title: 'AI & Data Science Intern',
      company: 'Amazon Web Services (AWS)',
      location: 'Bengaluru, India',
      stipend: '₹70,000 / month',
      duration: '6 Months',
      applyUrl: 'https://amazon.jobs',
      description: 'Develop machine learning pipelines, NLP models, and generative AI features for AWS cloud customers.',
      deadline: new Date('2026-09-15'),
      status: 'ACTIVE',
    },
  ];

  for (const i of internshipsData) {
    await prisma.internship.create({ data: i });
  }
  console.log('✅ Internship Listings seeded.');

  // 7. Seed Jobs
  const jobsData = [
    {
      title: 'Associate Software Engineer',
      company: 'TCS Innovation Labs',
      location: 'Bengaluru / Pune',
      package: '₹7.5 - ₹9.0 LPA',
      applyUrl: 'https://nextstep.tcs.com',
      description: 'Full-time entry-level engineering role focusing on enterprise web apps, microservices, and mobile solutions.',
      deadline: new Date('2026-11-30'),
      status: 'ACTIVE',
    },
    {
      title: 'Graduate Systems Engineer',
      company: 'Wipro Digital',
      location: 'Hyderabad / Chennai',
      package: '₹6.5 - ₹8.0 LPA',
      applyUrl: 'https://careers.wipro.com',
      description: 'Develop cloud infrastructure, DevOps pipelines, and enterprise API gateways for international clients.',
      deadline: new Date('2026-12-15'),
      status: 'ACTIVE',
    },
    {
      title: 'Frontend React Developer',
      company: 'Accenture India',
      location: 'Remote / Bengaluru',
      package: '₹8.0 - ₹10.0 LPA',
      applyUrl: 'https://accenture.com/careers',
      description: 'Build modern user interfaces with React, TypeScript, Next.js, and Tailwind CSS for global SaaS applications.',
      deadline: new Date('2026-11-15'),
      status: 'ACTIVE',
    },
  ];

  for (const j of jobsData) {
    await prisma.job.create({ data: j });
  }
  console.log('✅ Job Listings seeded.');

  // 8. Seed Government Exams
  const examsData = [
    {
      title: 'GATE 2027 — Computer Science & Information Technology',
      organizer: 'IIT Roorkee / IISc Bengaluru',
      eligibility: 'B.E. / B.Tech 3rd & 4th Year Students',
      examDate: new Date('2027-02-06'),
      applyUrl: 'https://gate.iitr.ac.in',
      description: 'National level competitive examination for M.Tech admissions in IISc/IITs and PSU job recruitment (IOCL, ONGC, NTPC, GAIL).',
      status: 'ACTIVE',
    },
    {
      title: 'ISRO Scientist / Engineer Recruitment Exam',
      organizer: 'Indian Space Research Organisation (ISRO)',
      eligibility: 'B.E. / B.Tech in CSE / ISE with Min 65% Marks',
      examDate: new Date('2026-11-20'),
      applyUrl: 'https://isro.gov.in/careers',
      description: 'Recruitment examination for Scientist/Engineer "SC" grade positions in Indian Space Research Organisation.',
      status: 'ACTIVE',
    },
    {
      title: 'BARC OCES / DGFS Scientific Officer Exam',
      organizer: 'Bhabha Atomic Research Centre (BARC)',
      eligibility: 'Final Year Engineering Students',
      examDate: new Date('2027-03-15'),
      applyUrl: 'https://barconlineexam.in',
      description: 'Selection exam for Scientific Officers in DAE units and BARC training school fellowship programs.',
      status: 'ACTIVE',
    },
  ];

  for (const e of examsData) {
    await prisma.governmentExam.create({ data: e });
  }
  console.log('✅ Government Exam Records seeded.');

  console.log('🎉 Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
