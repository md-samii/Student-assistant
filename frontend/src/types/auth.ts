export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface StudentProfile {
  id: string;
  userId: string;
  university: string;
  degree: string;
  branch: string;
  semester: number;
  section?: string | null;
  graduationYear: number;
  phone?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}

export interface AuthState {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
