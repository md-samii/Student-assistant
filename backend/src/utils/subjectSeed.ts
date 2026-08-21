export interface SubjectCatalogItem {
  code: string;
  name: string;
  university: string;
  branch: string;
  semester: number;
  description: string;
  modulesCount: number;
}

export const DEFAULT_SUBJECT_CATALOG: SubjectCatalogItem[] = [
  // Semester 5 - Computer Science & Engineering
  {
    code: 'CS501',
    name: 'Operating Systems',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 5,
    description: 'Processes, CPU Scheduling, Synchronization, Memory Management & File Systems.',
    modulesCount: 5,
  },
  {
    code: 'CS502',
    name: 'Database Management Systems',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 5,
    description: 'ER Modeling, Relational Algebra, SQL, Normalization, Transactions & Concurrency.',
    modulesCount: 5,
  },
  {
    code: 'CS503',
    name: 'Computer Networks',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 5,
    description: 'OSI & TCP/IP Stack, IP Addressing, Routing Algorithms, Transport Layer & Security.',
    modulesCount: 5,
  },
  {
    code: 'CS504',
    name: 'Software Engineering',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 5,
    description: 'Agile Methodologies, Requirements Analysis, System Design Patterns & Software Testing.',
    modulesCount: 5,
  },
  {
    code: 'CS505',
    name: 'Theory of Computation',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 5,
    description: 'Automata Theory, Regular Expressions, Context-Free Grammars & Turing Machines.',
    modulesCount: 5,
  },

  // Semester 6 - Computer Science & Engineering
  {
    code: 'CS601',
    name: 'Compiler Design',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 6,
    description: 'Lexical Analysis, Parsing, Syntax Directed Translation, Intermediate Code & Optimization.',
    modulesCount: 5,
  },
  {
    code: 'CS602',
    name: 'Artificial Intelligence & Machine Learning',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 6,
    description: 'Search Algorithms, Knowledge Representation, Supervised Learning, Neural Networks & Deep Learning.',
    modulesCount: 5,
  },
  {
    code: 'CS603',
    name: 'Web Technology & Frameworks',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 6,
    description: 'HTML5, CSS3, JavaScript ES6+, React, Node.js & REST API Integration.',
    modulesCount: 5,
  },
  {
    code: 'CS604',
    name: 'Cloud Computing & DevOps',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 6,
    description: 'Cloud Models (AWS/GCP), Virtualization, Containers, Docker & CI/CD Pipelines.',
    modulesCount: 5,
  },

  // Semester 7 - Computer Science & Engineering
  {
    code: 'CS701',
    name: 'Big Data Analytics',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 7,
    description: 'Hadoop Distributed File System, MapReduce, Apache Spark & NoSQL Databases.',
    modulesCount: 5,
  },
  {
    code: 'CS702',
    name: 'Cryptography & Network Security',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 7,
    description: 'Symmetric & Asymmetric Encryption, RSA, Digital Signatures & Firewall Security.',
    modulesCount: 5,
  },

  // Generic Semester 1 & 2 Subjects
  {
    code: 'MA101',
    name: 'Engineering Mathematics I',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 1,
    description: 'Calculus, Differential Equations, Linear Algebra & Infinite Series.',
    modulesCount: 5,
  },
  {
    code: 'CS102',
    name: 'Programming in C & Data Structures',
    university: 'Visvesvaraya Technological University (VTU)',
    branch: 'Computer Science & Engineering',
    semester: 1,
    description: 'Pointers, Arrays, Structures, Linked Lists, Stacks & Queues in C.',
    modulesCount: 5,
  },
];

export const getSubjectsForProfile = (branch: string, semester: number): SubjectCatalogItem[] => {
  const normalizedBranch = branch ? branch.trim() : 'Computer Science & Engineering';
  const targetSemester = semester || 5;

  const matches = DEFAULT_SUBJECT_CATALOG.filter(
    (item) => item.semester === targetSemester
  );

  if (matches.length > 0) {
    return matches;
  }

  // Fallback default subjects if specific semester catalog is custom
  return [
    {
      code: `SUB${targetSemester}01`,
      name: `Core Discipline Module ${targetSemester}.1`,
      university: 'Visvesvaraya Technological University (VTU)',
      branch: normalizedBranch,
      semester: targetSemester,
      description: `Advanced core syllabus topics for ${normalizedBranch} Semester ${targetSemester}.`,
      modulesCount: 5,
    },
    {
      code: `SUB${targetSemester}02`,
      name: `Core Discipline Module ${targetSemester}.2`,
      university: 'Visvesvaraya Technological University (VTU)',
      branch: normalizedBranch,
      semester: targetSemester,
      description: `Applied engineering principles and lab exercises for ${normalizedBranch} Semester ${targetSemester}.`,
      modulesCount: 5,
    },
    {
      code: `SUB${targetSemester}03`,
      name: `Professional Elective ${targetSemester}`,
      university: 'Visvesvaraya Technological University (VTU)',
      branch: normalizedBranch,
      semester: targetSemester,
      description: `Specialized domain elective course for ${normalizedBranch} Semester ${targetSemester}.`,
      modulesCount: 5,
    },
  ];
};
