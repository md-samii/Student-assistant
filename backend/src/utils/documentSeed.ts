export interface DocumentSeedItem {
  id: string;
  userId: string;
  name: string;
  type: 'RESUME' | 'CERTIFICATE' | 'MARKS_CARD' | 'INTERNSHIP_CERTIFICATE' | 'OTHER';
  fileUrl: string;
  storagePath: string;
  fileSize: number; // in bytes
  fileSizeFormatted: string;
  mimeType: string;
  uploadedAt: string;
}

export const DEFAULT_DOCUMENTS_CATALOG: DocumentSeedItem[] = [
  {
    id: 'doc_resume_1',
    userId: 'default_student',
    name: 'Rahul_Sharma_Software_Engineering_Resume_2026.pdf',
    type: 'RESUME',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    storagePath: 'student-docs/resumes/Rahul_Sharma_Resume_2026.pdf',
    fileSize: 245000,
    fileSizeFormatted: '245 KB',
    mimeType: 'application/pdf',
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'doc_cert_1',
    userId: 'default_student',
    name: 'AWS_Certified_Cloud_Practitioner_Certificate.pdf',
    type: 'CERTIFICATE',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    storagePath: 'student-docs/certificates/AWS_Cloud_Practitioner.pdf',
    fileSize: 1250000,
    fileSizeFormatted: '1.25 MB',
    mimeType: 'application/pdf',
    uploadedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'doc_marks_1',
    userId: 'default_student',
    name: 'VTU_Semester_4_Official_Marks_Card.pdf',
    type: 'MARKS_CARD',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    storagePath: 'student-docs/marks/VTU_Sem4_MarksCard.pdf',
    fileSize: 890000,
    fileSizeFormatted: '890 KB',
    mimeType: 'application/pdf',
    uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];
