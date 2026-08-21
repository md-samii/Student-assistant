export interface QuizQuestionItem {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface QuizSeedItem {
  id: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectName: string;
  moduleNumber: number;
  timeLimitMin: number;
  totalMarks: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: QuizQuestionItem[];
}

export const DEFAULT_QUIZ_CATALOG: QuizSeedItem[] = [
  // Operating Systems Quiz
  {
    id: 'quiz_os_m1',
    title: 'Operating Systems — CPU Scheduling & Process Control',
    description: 'Assess your knowledge on Process States, PCB, FCFS, SJF, Round Robin scheduling, and context switching.',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    moduleNumber: 1,
    timeLimitMin: 10,
    totalMarks: 3,
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q_os_1',
        questionText: 'Which CPU scheduling algorithm gives the minimum average waiting time for a given set of processes?',
        options: [
          'First Come First Served (FCFS)',
          'Shortest Job First (SJF)',
          'Round Robin (RR)',
          'Priority Scheduling',
        ],
        correctOption: 1,
        explanation: 'Shortest Job First (SJF) is mathematically proven to produce the minimum average waiting time for a given set of processes.',
      },
      {
        id: 'q_os_2',
        questionText: 'Which of the following is NOT a necessary condition for a Deadlock to occur?',
        options: [
          'Mutual Exclusion',
          'Hold and Wait',
          'Preemption of resources',
          'Circular Wait',
        ],
        correctOption: 2,
        explanation: 'NO Preemption is required for deadlock. If preemption of resources is allowed, deadlock cannot occur.',
      },
      {
        id: 'q_os_3',
        questionText: 'What is the phenomenon where a process is allocated more memory than required, leaving unused space inside the allocated block?',
        options: [
          'External Fragmentation',
          'Internal Fragmentation',
          'Paging Thrashing',
          'Segmentation Fault',
        ],
        correctOption: 1,
        explanation: 'Internal Fragmentation happens when fixed-sized memory blocks are allocated and the process uses less than the block size.',
      },
    ],
  },

  // Database Management Systems Quiz
  {
    id: 'quiz_dbms_m1',
    title: 'DBMS — SQL Queries & Database Normalization',
    description: 'Test your mastery of SQL Joins, Group By, 1NF, 2NF, 3NF, and BCNF normal forms.',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems',
    moduleNumber: 2,
    timeLimitMin: 10,
    totalMarks: 3,
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q_dbms_1',
        questionText: 'A relation is in 3NF if it is in 2NF and has no:',
        options: [
          'Partial Functional Dependency',
          'Transitive Functional Dependency',
          'Multivalued Dependency',
          'Join Dependency',
        ],
        correctOption: 1,
        explanation: '3NF requires that no non-prime attribute is transitively dependent on any candidate key.',
      },
      {
        id: 'q_dbms_2',
        questionText: 'Which SQL clause is used to filter groups created by the GROUP BY clause?',
        options: [
          'WHERE',
          'HAVING',
          'ORDER BY',
          'LIKE',
        ],
        correctOption: 1,
        explanation: 'HAVING is used to filter records after aggregation (GROUP BY), whereas WHERE filters rows before aggregation.',
      },
      {
        id: 'q_dbms_3',
        questionText: 'In ACID properties of a transaction, what does the letter "I" stand for?',
        options: [
          'Integrity',
          'Isolation',
          'Immutability',
          'Indexing',
        ],
        correctOption: 1,
        explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.',
      },
    ],
  },

  // Computer Networks Quiz
  {
    id: 'quiz_cn_m1',
    title: 'Computer Networks — OSI Layers & Subnetting',
    description: 'Evaluate your understanding of TCP/IP protocol stack, IP addressing, subnet masks, and transport protocols.',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks',
    moduleNumber: 1,
    timeLimitMin: 10,
    totalMarks: 2,
    difficulty: 'Beginner',
    questions: [
      {
        id: 'q_cn_1',
        questionText: 'Which OSI layer is responsible for end-to-end process-to-process communication and port addressing?',
        options: [
          'Network Layer',
          'Data Link Layer',
          'Transport Layer',
          'Application Layer',
        ],
        correctOption: 2,
        explanation: 'The Transport Layer (Layer 4) handles process-to-process delivery using port numbers (e.g. TCP/UDP).',
      },
      {
        id: 'q_cn_2',
        questionText: 'What is the default subnet mask for a Class C IP address?',
        options: [
          '255.0.0.0',
          '255.255.0.0',
          '255.255.255.0',
          '255.255.255.255',
        ],
        correctOption: 2,
        explanation: 'Class C uses 24 network bits and 8 host bits, giving a default subnet mask of 255.255.255.0.',
      },
    ],
  },
];
