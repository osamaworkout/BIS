// API Response Types (from GET /api/Students/All)
export interface StudentUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationalNo: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  studentID: number;
  gpa: number;
  enrollmentDate: string;
  studentLevel: string;
  totalGrades: number;
  sittingNumber: string;
  parentPhone: string;
  address: string;
  notes: string;
  guidanceGroupID: number;
  user: StudentUser;
}

// Request Payload Types (for PUT /api/Students)
export interface StudentUserPayload {
  id: number;
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phone: string;
  nationalNo: string;
  roleId: number;
  profileImage?: string;
}

export interface StudentPayload {
  studentID: number;
  gpa: number;
  enrollmentDate: string;
  studentLevel: string;
  totalGrades: number;
  sittingNumber: string;
  parentPhone: string;
  address: string;
  notes: string;
  guidanceGroupID: number;
  user: StudentUserPayload;
}

export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://bis.runasp.net/api";

export interface ImportError {
  rowNumber: number;
  studentName: string;
  errorMessage: string;
}

export interface ImportResponse {
  totalRows: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  errors: ImportError[];
}
