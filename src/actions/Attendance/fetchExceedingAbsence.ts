import { getAuthHeaders, getApiUrl } from "@/lib/api";

export interface StudentAbsence {
  studentId: number;
  studentName: string;
  nationalNo: string;
  email: string;
  absentCount: number;
  totalLectures: number;
  absentPercentage: number;
}

export async function fetchExceedingAbsence(
  courseId: number,
  absencePercentage: number
): Promise<StudentAbsence[]> {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}/Attendance/course/${courseId}/exceeding-absence?absencePercentage=${absencePercentage}`;

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch student absence data");
  }

  return res.json();
}
