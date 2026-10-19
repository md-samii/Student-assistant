
export type CourseType =
    | 'CORE'
    | 'ELECTIVE'
    | 'OPEN_ELECTIVE'
    | 'LAB'
    | 'PROJECT'
    | 'INTERNSHIP'
    | 'COMMON'
    | 'ABILITY_ENHANCEMENT';

export interface SubjectCatalogItem {
    code: string;
    name: string;
    university: string;
    branch: string;
    semester: number;
    description: string;
    modulesCount: number;
    courseType: CourseType;
    electiveGroup?: string;
    scheme: 'VTU_2022';
}

const UNIVERSITY = 'Visvesvaraya Technological University (VTU)';
const BRANCH = 'Computer Science & Engineering';

const course = (
    code: string,
    name: string,
    semester: number,
    courseType: CourseType = 'CORE',
    electiveGroup?: string,
): SubjectCatalogItem => ({
    code,
    name,
    semester,
    courseType,
    ...(electiveGroup ? { electiveGroup } : {}),
    university: UNIVERSITY,
    branch: BRANCH,
    description: `${name} — VTU 2022 Scheme, CSE Semester ${semester}.`,
    modulesCount: ['LAB', 'PROJECT', 'INTERNSHIP'].includes(courseType)
        ? 0
        : 5,
    scheme: 'VTU_2022',
});

/**
 * Official VTU 2022-scheme CSE catalog.
 * Elective entries represent available choices, not courses
 * that every student must take.
 *
 * Verify course details against current VTU documents before
 * using this as a final, exhaustive catalog.
 */
export const CSE_SUBJECT_CATALOG: SubjectCatalogItem[] = [
    // Semester 1 — common CSE-stream courses
    course('BMATS101', 'Mathematics-I for CSE Stream', 1),
    course('BPHYS102', 'Applied Physics for CSE Stream', 1, 'COMMON', 'SCIENCE_GROUP'),
    course('BCHES102', 'Applied Chemistry for CSE Stream', 1, 'COMMON', 'SCIENCE_GROUP'),
    course('BPOPS103', 'Principles of Programming Using C', 1),
    course('BESCK104A', 'Introduction to Civil Engineering', 1, 'ELECTIVE', 'ESC_I'),
    course('BESCK104B', 'Introduction to Electrical Engineering', 1, 'ELECTIVE', 'ESC_I'),
    course('BESCK104C', 'Introduction to Electronics Communication', 1, 'ELECTIVE', 'ESC_I'),
    course('BESCK104D', 'Introduction to Mechanical Engineering', 1, 'ELECTIVE', 'ESC_I'),
    course('BETCK105H', 'Introduction to Internet of Things', 1, 'ELECTIVE', 'ETC_I'),
    course('BETCK105I', 'Introduction to Cyber Security', 1, 'ELECTIVE', 'ETC_I'),
    course('BPLCK105B', 'Introduction to Python Programming', 1, 'ELECTIVE', 'PLC_I'),

    // Semester 2
    course('BMATS201', 'Mathematics-II for CSE Stream', 2),
    course('BCHES202', 'Applied Chemistry for CSE Stream', 2, 'COMMON', 'SCIENCE_GROUP'),
    course('BCEDK203', 'Computer-Aided Engineering Drawing', 2, 'COMMON', 'SCIENCE_GROUP'),
    course('BPLCK205A', 'Introduction to Web Programming', 2, 'ELECTIVE', 'PLC_II'),
    course('BPLCK205C', 'Basics of Java Programming', 2, 'ELECTIVE', 'PLC_II'),
    course('BPLCK205D', 'Introduction to C++ Programming', 2, 'ELECTIVE', 'PLC_II'),

    // Semester 3
    course('BCS301', 'Mathematics for Computer Science', 3),
    course('BCS302', 'Digital Design & Computer Organization', 3),
    course('BCS303', 'Operating Systems', 3),
    course('BCS304', 'Data Structures and Applications', 3),
    course('BCSL305', 'Data Structures Lab', 3, 'LAB'),
    course('BSCK307', 'Social Connect and Responsibility', 3, 'COMMON'),

    // Semester 4
    course('BCS401', 'Analysis & Design of Algorithms', 4),
    course('BCS402', 'Microcontrollers', 4),
    course('BCS403', 'Database Management Systems', 4),
    course('BCSL404', 'Analysis & Design of Algorithms Lab', 4, 'LAB'),
    course('BBOC407', 'Biology for Computer Engineers', 4, 'COMMON'),
    course('BUHK408', 'Universal Human Values Course', 4, 'COMMON'),

    // Semester 5
    course('BCS501', 'Software Engineering & Project Management', 5),
    course('BCS502', 'Computer Networks', 5),
    course('BCS503', 'Theory of Computation', 5),
    course('BCSL504', 'Web Technology Lab', 5, 'LAB'),
    course('BCS515A', 'Computer Graphics', 5, 'ELECTIVE', 'PEC_515'),
    course('BCS515B', 'Artificial Intelligence', 5, 'ELECTIVE', 'PEC_515'),
    course('BCS515C', 'Unix System Programming', 5, 'ELECTIVE', 'PEC_515'),
    course('BCS515D', 'Distributed Systems', 5, 'ELECTIVE', 'PEC_515'),
    course('BCS586', 'Mini Project', 5, 'PROJECT'),
    course('BRMK557', 'Research Methodology and IPR', 5, 'COMMON'),
    course('BCS508', 'Environmental Studies and E-waste Management', 5, 'COMMON'),

    // Semester 6
    course('BCS601', 'Cloud Computing', 6),
    course('BCS602', 'Machine Learning', 6),
    course('BCS613A', 'Blockchain Technology', 6, 'ELECTIVE', 'PEC_613'),
    course('BCS613B', 'Computer Vision', 6, 'ELECTIVE', 'PEC_613'),
    course('BCS613C', 'Compiler Design', 6, 'ELECTIVE', 'PEC_613'),
    course('BCS613D', 'Advanced Java', 6, 'ELECTIVE', 'PEC_613'),
    course('BCSL606', 'Machine Learning Lab', 6, 'LAB'),
    course('BCS685', 'Project Phase I', 6, 'PROJECT'),

    // Semester 7
    course('BCS701', 'Internet of Things', 7),
    course('BCS702', 'Parallel Computing', 7),
    course('BCS703', 'Cryptography & Network Security', 7),
    course('BCS714A', 'Deep Learning', 7, 'ELECTIVE', 'PEC_714'),
    course('BCS714B', 'Natural Language Processing', 7, 'ELECTIVE', 'PEC_714'),
    course('BCS714D', 'Big Data Analytics', 7, 'ELECTIVE', 'PEC_714'),
    course('BCS786', 'Major Project Phase II', 7, 'PROJECT'),

    // Semester 8
    course('BCS801x', 'Professional Elective — Online Course', 8, 'ELECTIVE', 'PEC_801'),
    course('BCS802x', 'Open Elective — Online Course', 8, 'OPEN_ELECTIVE', 'OEC_802'),
    course('BCS803', 'Internship (Industry/Research)', 8, 'INTERNSHIP'),
];

export const getCSESubjectsForSemester = (
    semester: number,
): SubjectCatalogItem[] =>
    CSE_SUBJECT_CATALOG.filter((item) => item.semester === semester);
