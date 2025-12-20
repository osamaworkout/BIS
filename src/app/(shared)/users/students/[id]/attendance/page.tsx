"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { fetchStudentAttendance } from "@/actions/Attendance/fetchStudentAttendance";
import { fetchStudentAttendanceByCourse } from "@/actions/Attendance/fetchStudentAttendanceByCourse";
import { fetchCoursesByLevel } from "@/actions/Course/fetchCoursesByLevel";
import { AttendanceRecord } from "@/actions/Attendance/types";
import { Course } from "@/actions/Course/types";

export default function StudentAttendancePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = Number(params.id);
  const studentLevel = searchParams.get("level");

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      loadInitialData();
    }
  }, [studentId]);

  const getLevelId = (levelName: string | null): number => {
    if (!levelName) return 1; // Default
    if (levelName.includes("الاول")) return 1;
    if (levelName.includes("الثاني") || levelName.includes("الثانى")) return 2;
    if (levelName.includes("الثالث")) return 3;
    if (levelName.includes("الرابع")) return 4;
    return 1;
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all attendance
      const attendanceData = await fetchStudentAttendance(studentId);
      setAttendance(attendanceData);

      // Fetch courses if level is available
      if (studentLevel) {
        const levelId = getLevelId(studentLevel);
        const coursesData = await fetchCoursesByLevel(levelId);
        setCourses(coursesData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = Number(e.target.value);
    setSelectedCourseId(courseId || null);

    try {
      setLoading(true);
      if (courseId) {
        const data = await fetchStudentAttendanceByCourse(studentId, courseId);
        setAttendance(data);
      } else {
        // Fetch all again if "All Courses" selected
        const data = await fetchStudentAttendance(studentId);
        setAttendance(data);
      }
    } catch (err) {
      setError("Failed to filter attendance");
    } finally {
      setLoading(false);
    }
  };

  const totalSessions = attendance.length;
  const presentCount = attendance.filter((r) => r.status === "Present").length;
  const absentCount = totalSessions - presentCount;
  const attendancePercentage = totalSessions > 0 
    ? Math.round((presentCount / totalSessions) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-xl shadow-lg w-full text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          سجل الحضور
        </h1>
        <div className="flex gap-4 items-center">
            {courses.length > 0 && (
            <select
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
              onChange={handleCourseChange}
              value={selectedCourseId || ""}
            >
              <option value="">كل المواد</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </select>
            )}
        </div>
      </div>

      {/* Statistics Cards */}
      {!loading && attendance.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              إجمالي المحاضرات
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalSessions}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              عدد مرات الحضور
            </h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {presentCount}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
              عدد مرات الغياب
            </h3>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {absentCount}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              نسبة الحضور
            </h3>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {attendancePercentage}%
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-lg text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <span className="text-gray-600 dark:text-gray-400">
            جارٍ تحميل البيانات...
          </span>
        </div>
      ) : attendance.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-gray-600 dark:text-gray-400">
            لا يوجد سجل حضور لهذا الطالب
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  المادة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الوقت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  النوع
                </th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  المكان
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {attendance.map((record) => (
                <tr
                  key={record.attendanceId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {record.courseName}
                    <span className="block text-xs text-gray-500">
                      {record.courseCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {record.sessionDate.split("T")[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {record.sessionStartTime.slice(0, 5)} - {record.sessionEndTime.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === "Present"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {record.status === "Present" ? "حاضر" : "غائب"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {record.sessionType}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {record.roomName}- {record.roomLocation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}