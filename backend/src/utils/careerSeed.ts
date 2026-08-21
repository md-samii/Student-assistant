export interface CareerOpportunityItem {
  id: string;
  title: string;
  company: string;
  logoUrl: string;
  category: 'INTERNSHIP' | 'JOB' | 'GOVT_EXAM';
  eligibleBranches: string[];
  eligibleSemesters: number[];
  location: string;
  stipendOrSalary: string;
  deadline: string;
  requiredSkills: string[];
  description: string;
  applyUrl: string;
}

export interface StudentProjectItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveDemoUrl?: string;
  createdAt: string;
}

export const DEFAULT_CAREER_OPPORTUNITIES: CareerOpportunityItem[] = [
  // Internships
  {
    id: 'opp_int_1',
    title: 'Software Engineering Summer Intern 2026',
    company: 'Google India',
    logoUrl: 'https://www.google.com/favicon.ico',
    category: 'INTERNSHIP',
    eligibleBranches: ['Computer Science & Engineering', 'Information Science & Engineering', 'Electronics & Communication Engineering'],
    eligibleSemesters: [5, 6, 7],
    location: 'Bangalore / Hyderabad (Hybrid)',
    stipendOrSalary: '₹85,000 / month',
    deadline: '2026-08-30',
    requiredSkills: ['Data Structures', 'C++', 'Java', 'Python', 'Algorithms'],
    description: 'Work alongside world-class Google engineers building large-scale distributed systems and AI applications.',
    applyUrl: 'https://careers.google.com',
  },
  {
    id: 'opp_int_2',
    title: 'Full Stack Web Development Intern',
    company: 'Microsoft Technology Center',
    logoUrl: 'https://www.microsoft.com/favicon.ico',
    category: 'INTERNSHIP',
    eligibleBranches: ['Computer Science & Engineering', 'Information Science & Engineering'],
    eligibleSemesters: [4, 5, 6, 7],
    location: 'Bangalore, India',
    stipendOrSalary: '₹75,000 / month',
    deadline: '2026-09-15',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'Azure', 'REST APIs'],
    description: 'Build modern responsive cloud interfaces and microservices for Azure enterprise clients.',
    applyUrl: 'https://careers.microsoft.com',
  },

  // Full-Time Graduate Jobs
  {
    id: 'opp_job_1',
    title: 'Associate Software Engineer (Graduate Hire)',
    company: 'TCS Innovation Labs',
    logoUrl: 'https://www.tcs.com/favicon.ico',
    category: 'JOB',
    eligibleBranches: ['Computer Science & Engineering', 'Information Science & Engineering', 'Electronics & Communication Engineering', 'Mechanical Engineering'],
    eligibleSemesters: [7, 8],
    location: 'Bangalore / Pune / Chennai',
    stipendOrSalary: '7.5 – 9.0 LPA',
    deadline: '2026-10-01',
    requiredSkills: ['Java', 'SQL', 'Git', 'Problem Solving'],
    description: 'Entry-level full-time software engineering role for graduating engineering seniors.',
    applyUrl: 'https://nextstep.tcs.com',
  },

  // Government Exams
  {
    id: 'opp_govt_1',
    title: 'GATE 2027 Entrance Examination & PSU Recruitment',
    company: 'IIT Roorkee / GATE Authority',
    logoUrl: 'https://gate2024.iisc.ac.in/favicon.ico',
    category: 'GOVT_EXAM',
    eligibleBranches: ['Computer Science & Engineering', 'Electronics & Communication Engineering', 'Mechanical Engineering', 'Civil Engineering'],
    eligibleSemesters: [5, 6, 7, 8],
    location: 'All-India Exam Centers',
    stipendOrSalary: 'M.Tech Fellowship / PSU CTC 14+ LPA',
    deadline: '2026-09-28',
    requiredSkills: ['Engineering Mathematics', 'Core Syllabus Subjects', 'Aptitude'],
    description: 'National entrance examination for M.Tech admissions in IITs/NITs and direct recruitment to PSUs (IOCL, NTPC, ISRO, ONGC).',
    applyUrl: 'https://gate.iitr.ac.in',
  },
  {
    id: 'opp_govt_2',
    title: 'ISRO Scientist / Engineer (SC) Exam 2026',
    company: 'Indian Space Research Organisation (ISRO)',
    logoUrl: 'https://www.isro.gov.in/favicon.ico',
    category: 'GOVT_EXAM',
    eligibleBranches: ['Computer Science & Engineering', 'Electronics & Communication Engineering', 'Mechanical Engineering'],
    eligibleSemesters: [7, 8],
    location: 'ISRO Centers (ISITE Bangalore, VSSC Trivandrum)',
    stipendOrSalary: 'Level 10 Pay Matrix (₹56,100 + DA/HRA ~ 10.5 LPA)',
    deadline: '2026-10-15',
    requiredSkills: ['Core Engineering Subjects', 'ISRO PYQs', 'Technical Interview'],
    description: 'Direct recruitment exam for Scientist/Engineer Scientist posts across ISRO satellite & launch centers.',
    applyUrl: 'https://www.isro.gov.in/Careers.html',
  },
];

export const DEFAULT_STUDENT_PROJECTS: StudentProjectItem[] = [
  {
    id: 'proj_1',
    userId: 'default_student',
    title: 'AI Student Assistant Platform (Final Year Project)',
    description: 'Full-stack web companion with personalized syllabus subject loaders, OpenAI GPT-4o academic assistant, Google Drive PDF viewer, and practice quizzes.',
    techStack: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'Prisma', 'OpenAI API'],
    githubUrl: 'https://github.com/rahulsharma/ai-student-assistant',
    liveDemoUrl: 'http://localhost:5173',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'proj_2',
    userId: 'default_student',
    title: 'Smart Campus Transport Tracking Mobile App',
    description: 'Real-time GPS bus tracking app for college buses built with React Native and WebSockets.',
    techStack: ['React Native', 'Node.js', 'Socket.io', 'Google Maps API'],
    githubUrl: 'https://github.com/rahulsharma/smart-campus-bus-tracker',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];
