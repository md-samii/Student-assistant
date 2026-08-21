export interface ResourceSeedItem {
  id: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectName: string;
  moduleNumber: number;
  type: 'PDF_NOTES' | 'PPT' | 'TUTORIAL' | 'PREVIOUS_PAPER' | 'LAB_MANUAL' | 'CODING_EXERCISE';
  driveUrl: string;
  fileSize: string;
  uploadedBy: string;
}

export const DEFAULT_RESOURCES_CATALOG: ResourceSeedItem[] = [
  // Operating Systems (CS501)
  {
    id: 'res_os_m1',
    title: 'Module 1: Introduction to Operating Systems & CPU Scheduling',
    description: 'Complete syllabus notes covering Process Control Blocks (PCB), System Calls, and Scheduling Algorithms (FCFS, SJF, Round Robin, Priority).',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    moduleNumber: 1,
    type: 'PDF_NOTES',
    driveUrl: 'https://drive.google.com/file/d/1u3NfM3YgKzL58aK-9w4H6g6y6/view',
    fileSize: '4.2 MB',
    uploadedBy: 'Prof. Ramesh Kumar (HOD CS)',
  },
  {
    id: 'res_os_m2',
    title: 'Module 2: Process Synchronization & Banker’s Algorithm',
    description: 'Detailed PPT slides covering Semaphores, Monitors, Classical Synchronization Problems (Producer-Consumer, Dining Philosophers) & Banker’s Safety Algorithm.',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    moduleNumber: 2,
    type: 'PPT',
    driveUrl: 'https://drive.google.com/file/d/1v4OfN4ZhLzM69bL-0x5I7h7z7/view',
    fileSize: '6.8 MB',
    uploadedBy: 'Dept of Computer Science',
  },
  {
    id: 'res_os_m3',
    title: 'Module 3: Memory Management & Virtual Memory Paging',
    description: 'Syllabus PDF notes covering Contiguous Allocation, Paging, Segmentation, Page Replacement Algorithms (FIFO, LRU, Optimal) & Thrashing.',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    moduleNumber: 3,
    type: 'PDF_NOTES',
    driveUrl: 'https://drive.google.com/file/d/1w5PgO5AiMaN70cM-1y6J8i8a8/view',
    fileSize: '3.9 MB',
    uploadedBy: 'VTU Academic Board',
  },
  {
    id: 'res_os_pyq',
    title: 'VTU Operating Systems 2021-2024 Solved Question Papers',
    description: 'Compilation of past 4 years end-semester examination question papers with step-by-step model answers.',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    moduleNumber: 5,
    type: 'PREVIOUS_PAPER',
    driveUrl: 'https://drive.google.com/file/d/1x6QhP6BjNbO81dN-2z7K9j9b9/view',
    fileSize: '8.5 MB',
    uploadedBy: 'Exam Cell',
  },

  // Database Management Systems (CS502)
  {
    id: 'res_dbms_m1',
    title: 'Module 1: ER Modeling & Relational Algebra',
    description: 'Introduction to DBMS architecture, Entity-Relationship diagrams, Weak entities, and Relational Algebra operators.',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems',
    moduleNumber: 1,
    type: 'PDF_NOTES',
    driveUrl: 'https://drive.google.com/file/d/1y7RiQ7CkOcP92eO-3a8L0k0c0/view',
    fileSize: '5.1 MB',
    uploadedBy: 'Dr. Sunita Rao',
  },
  {
    id: 'res_dbms_m2',
    title: 'Module 2: Advanced SQL Queries & Triggers',
    description: 'SQL DDL/DML, Nested Queries, Joins, Views, Stored Procedures, and Database Triggers with code examples.',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems',
    moduleNumber: 2,
    type: 'TUTORIAL',
    driveUrl: 'https://drive.google.com/file/d/1z8SjR8DlPdQ03fP-4b9M1l1d1/view',
    fileSize: '2.7 MB',
    uploadedBy: 'Database Lab Coordinator',
  },
  {
    id: 'res_dbms_m3',
    title: 'Module 3: Normalization (1NF to BCNF, 4NF)',
    description: 'Functional Dependencies, Inference Rules (Armstrong’s Axioms), 1NF, 2NF, 3NF, BCNF decomposition step-by-step notes.',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems',
    moduleNumber: 3,
    type: 'PDF_NOTES',
    driveUrl: 'https://drive.google.com/file/d/1a9TkS9EmQeR14gQ-5cA2m2e2e/view',
    fileSize: '3.4 MB',
    uploadedBy: 'Dept of Computer Science',
  },

  // Computer Networks (CS503)
  {
    id: 'res_cn_m1',
    title: 'Module 1: OSI & TCP/IP Layered Architecture',
    description: 'Layered network models, Encapsulation, Packet switching vs Circuit switching, and Physical Layer fundamentals.',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks',
    moduleNumber: 1,
    type: 'PPT',
    driveUrl: 'https://drive.google.com/file/d/1b0UlT0FnRfS25hR-6dB3n3f3f/view',
    fileSize: '7.2 MB',
    uploadedBy: 'Prof. Anand Verma',
  },
  {
    id: 'res_cn_lab',
    title: 'Computer Networks Cisco Packet Tracer Lab Manual',
    description: 'Complete practical lab manual for IP Addressing, Subnetting, Router Configuration, VLANs & Wireshark Packet Sniffing.',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks',
    moduleNumber: 4,
    type: 'LAB_MANUAL',
    driveUrl: 'https://drive.google.com/file/d/1c1VmU1GoSgT36iS-7eC4o4g4g/view',
    fileSize: '11.4 MB',
    uploadedBy: 'Networks Laboratory Staff',
  },

  // Software Engineering (CS504)
  {
    id: 'res_se_m1',
    title: 'Module 1: Software Process Models & Agile Development',
    description: 'Waterfall, Spiral, V-Model, Scrum Framework, User Stories, and Sprint Planning notes.',
    subjectCode: 'CS504',
    subjectName: 'Software Engineering',
    moduleNumber: 1,
    type: 'PDF_NOTES',
    driveUrl: 'https://drive.google.com/file/d/1d2WmV2HpThU47jT-8fD5p5h5h/view',
    fileSize: '3.1 MB',
    uploadedBy: 'Software Dept',
  },
];
