
import {
  CSE_SUBJECT_CATALOG,
  getCSESubjectsForSemester,
  type SubjectCatalogItem,
} from './subjectCatalog';

export type { SubjectCatalogItem };

export const DEFAULT_SUBJECT_CATALOG: SubjectCatalogItem[] =
  CSE_SUBJECT_CATALOG;

export const getSubjectsForProfile = (
  branch: string,
  semester: number,
): SubjectCatalogItem[] => {
  const normalizedBranch = branch?.trim() ||
    'Computer Science & Engineering';

  const targetSemester = semester || 1;

  // This catalog currently supports CSE only.
  if (!normalizedBranch.toLowerCase().includes('computer science')) {
    return [];
  }

  return getCSESubjectsForSemester(targetSemester);
};
