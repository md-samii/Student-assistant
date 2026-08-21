export interface VideoRecommendationItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectName: string;
  channelName: string;
  thumbnailUrl: string;
  duration: string;
  viewsCount: string;
  publishedDate: string;
  isVerifiedChannel: boolean;
}

export const DEFAULT_VIDEO_CATALOG: VideoRecommendationItem[] = [
  // Operating Systems
  {
    id: 'vid_os_1',
    youtubeVideoId: 'bkSWJJZNgf8',
    title: 'Introduction to Operating System | OS Course Overview',
    description: 'Complete introductory lecture covering what an OS is, kernel types, process management, and CPU execution modes.',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    channelName: 'Gate Smashers',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    duration: '14:25',
    viewsCount: '1.2M views',
    publishedDate: '2023',
    isVerifiedChannel: true,
  },
  {
    id: 'vid_os_2',
    youtubeVideoId: 'vBURTt97EkA',
    title: 'CPU Scheduling Algorithms (FCFS, SJF, Round Robin & Priority)',
    description: 'Comprehensive comparison of CPU scheduling algorithms with solved numerical exam problems.',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    channelName: 'Gate Smashers',
    duration: '28:10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
    viewsCount: '850K views',
    publishedDate: '2023',
    isVerifiedChannel: true,
  },
  {
    id: 'vid_os_3',
    youtubeVideoId: 'r_LpOi6_g5s',
    title: 'Banker’s Algorithm for Deadlock Avoidance Explained',
    description: 'Step-by-step tutorial on calculating Need Matrix, Available Resources, and finding Safe Sequences.',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    channelName: 'Jenny’s Lectures CS/IT',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
    duration: '22:15',
    viewsCount: '620K views',
    publishedDate: '2022',
    isVerifiedChannel: true,
  },

  // Database Management Systems
  {
    id: 'vid_dbms_1',
    youtubeVideoId: 'HXV3zeQKqGY',
    title: 'SQL Tutorial - Full Database Course for Beginners',
    description: 'Learn SQL in this complete 4-hour course. Covers DDL, DML, JOINS, Group By, Subqueries, and Indexing.',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems',
    channelName: 'freeCodeCamp.org',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600',
    duration: '4:20:15',
    viewsCount: '5.8M views',
    publishedDate: '2023',
    isVerifiedChannel: true,
  },
  {
    id: 'vid_dbms_2',
    youtubeVideoId: 'UrYLYV7WSHM',
    title: 'Database Normalization (1NF, 2NF, 3NF, BCNF) Made Easy',
    description: 'Clear explanation of Functional Dependencies and Normal Forms with exam-oriented solved examples.',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems',
    channelName: 'Gate Smashers',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=600',
    duration: '19:40',
    viewsCount: '1.4M views',
    publishedDate: '2023',
    isVerifiedChannel: true,
  },

  // Computer Networks
  {
    id: 'vid_cn_1',
    youtubeVideoId: 'IPvYjXWnt6s',
    title: 'OSI Model Layers Explained (7 Layers Animation)',
    description: 'Visual animation explaining Physical, Data Link, Network, Transport, Session, Presentation & Application layers.',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks',
    channelName: 'NetworkChuck',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
    duration: '16:50',
    viewsCount: '2.1M views',
    publishedDate: '2023',
    isVerifiedChannel: true,
  },
  {
    id: 'vid_cn_2',
    youtubeVideoId: '5WFIyuMSC0U',
    title: 'IPv4 Subnetting & CIDR Notation Tutorial',
    description: 'Fast subnetting method for network engineers and university exam preparation.',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks',
    channelName: 'Abdul Bari',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
    duration: '24:05',
    viewsCount: '1.9M views',
    publishedDate: '2022',
    isVerifiedChannel: true,
  },

  // Software Engineering
  {
    id: 'vid_se_1',
    youtubeVideoId: '9W6c3XFqW24',
    title: 'Agile Methodology & Scrum Framework Explained',
    description: 'Learn Agile principles, Scrum ceremonies (Daily Standup, Sprint Planning, Retrospective), and Kanban.',
    subjectCode: 'CS504',
    subjectName: 'Software Engineering',
    channelName: 'Fireship',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600',
    duration: '11:30',
    viewsCount: '980K views',
    publishedDate: '2023',
    isVerifiedChannel: true,
  },
];
