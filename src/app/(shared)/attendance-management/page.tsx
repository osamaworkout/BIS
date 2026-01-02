"use client";

import React, { useState, useEffect } from "react";
import { fetchCoursesByLevel } from "@/actions/Course/fetchCoursesByLevel";
import {
  fetchExceedingAbsence,
  StudentAbsence,
} from "@/actions/Attendance/fetchExceedingAbsence";
import { Course } from "@/actions/Course/types";

export default function AttendanceManagementPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [absencePercentage, setAbsencePercentage] = useState<number>(25);
  const [students, setStudents] = useState<StudentAbsence[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const levels = [
    { id: "1", name: "الفرقة الأولى" },
    { id: "2", name: "الفرقة الثانية" },
    { id: "3", name: "الفرقة الثالثة" },
    { id: "4", name: "الفرقة الرابعة" },
  ];

  useEffect(() => {
    if (selectedLevel) {
      loadCourses(parseInt(selectedLevel));
    } else {
      setCourses([]);
      setSelectedCourse("");
    }
  }, [selectedLevel]);

  const loadCourses = async (levelId: number) => {
    try {
      const data = await fetchCoursesByLevel(levelId);
      setCourses(data);
    } catch (err) {
      console.error("Failed to load courses", err);
      // Optionally handle error
    }
  };

  const handleSearch = async () => {
    if (!selectedCourse) {
      setError("يرجى اختيار المقرر");
      return;
    }

    setLoading(true);
    setError(null);
    setStudents(null);

    try {
      const data = await fetchExceedingAbsence(
        parseInt(selectedCourse),
        absencePercentage
      );
      setStudents(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "فشل في جلب البيانات";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        إدارة الغياب
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
        {/* Level Selection */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            اختر الفرقة
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">اختر الفرقة...</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course Selection */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            اختر المقرر
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedLevel || courses.length === 0}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">
              {courses.length === 0 && selectedLevel
                ? "لا توجد مقررات"
                : "اختر المقرر..."}
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseName}
              </option>
            ))}
          </select>
        </div>

        {/* Absence Percentage */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            نسبة الغياب %
          </label>
          <input
            type="number"
            // step="1"
            // min="0"
            // max="100"
            value={absencePercentage}
            onChange={(e) => setAbsencePercentage(parseFloat(e.target.value))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow transition duration-200 h-10 mb-[1px]"
        >
          {loading ? "جارٍ البحث..." : "بحث"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {students && (
        <div className="overflow-x-auto">
           {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    لا يوجد طلاب يتجاوزون نسبة الغياب المحددة في هذا المقرر.
                </div>
           ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الرقم القومي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  عدد مرات الغياب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  إجمالي المحاضرات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  نسبة الغياب
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student, idx) => (
                <tr
                  key={idx} // Using index as key since studentId might be 0 per mock/example
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.nationalNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.absentCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.totalLectures}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 dark:text-red-400">
                    {student.absentPercentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           )}
        </div>
      )}
    </div>
  );
}
