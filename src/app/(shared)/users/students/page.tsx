"use client";

import React, { useState, useEffect } from "react";
import { fetchStudents } from "@/actions/Student/fetchStudents";
import { addStudentsUsingFile } from "@/actions/Student/addStudentsUsingFile";
import { deleteStudent } from "@/actions/Student/deleteStudent";
import { addStudent } from "@/actions/Student/addStudent";
import { updateStudent } from "@/actions/Student/updateStudent";
import { Student, StudentPayload, ImportResponse, ImportError } from "@/actions/Student/types";
import StudentForm from "@/components/StudentForm";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [importResponse, setImportResponse] = useState<ImportResponse | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(18);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudents();
      setStudents(data);
      console.log("Fetched students:", data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل تحميل بيانات الطلاب";
      setError(errorMessage);
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentID: number) => {
    try {
      setDeletingId(studentID);
      await deleteStudent(studentID);
      setStudents((prev) => prev.filter((s) => s.studentID !== studentID));
      setDeleteError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل حذف الطالب";
      setDeleteError(errorMessage);
      setTimeout(() => setDeleteError(null), 4000);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const openDeleteModal = (studentID: number) => {
    setStudentToDelete(studentID);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: StudentPayload) => {
    try {
      if (editingStudent) {
        // Update existing student
        await updateStudent(data);
        // Refresh the student list
        await loadStudents();
      } else {
        // Add new student
        await addStudent(data);
        // Refresh the student list
        await loadStudents();
      }
      setShowForm(false);
      setEditingStudent(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل حفظ البيانات";
      throw new Error(errorMessage);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const getLevelText = (level: string): string => {
    const levels: { [key: string]: string } = {
      الاول: "الفرقة الأولى",
      الثانى: "الفرقة الثانية",
      الثالث: "الفرقة الثالثة",
      الرابع: "الفرقة الرابعة",
    };
    return levels[level] || level;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Only accept Excel files
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setUploadMessage("يرجى اختيار ملف Excel بصيغة xlsx أو xls فقط.");
      setTimeout(() => setUploadMessage(null), 4000);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setImportResponse(null);
      
      const response = await addStudentsUsingFile(file);
      await loadStudents();
      
      setImportResponse(response);
      
      if (response.failedCount > 0) {
        setUploadMessage(`تم رفع الملف. نجح: ${response.successCount}، فشل: ${response.failedCount}`);
      } else {
        setUploadMessage("تم رفع الملف بنجاح!");
      }
      
      // Clear message after 4 seconds unless there are errors to inspect
      if (response.failedCount === 0) {
        setTimeout(() => setUploadMessage(null), 4000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "فشل رفع الملف";
      setUploadMessage(errorMessage);
      setTimeout(() => setUploadMessage(null), 4000);
    } finally {
      setLoading(false);
      // Reset input value to allow re-uploading the same file
      event.target.value = "";
    }
  };

  // Search & Pagination Logic
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.user.name.toLowerCase().includes(query) ||
      student.sittingNumber.toString().includes(query) ||
      student.user.email.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);



  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-2.5">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        إدارة الطلاب
      </h1>
        <div className="relative w-96 mx-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="بحث بالاسم، الرقم الجامعي، أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
        </div>
        </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          عرض وإدارة سجلات جميع الطلاب.
        </p>

        <div className="flex gap-2">
          <button
            onClick={loadStudents}
            className="bg-gray-600 dark:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-gray-700 dark:hover:bg-gray-600 transition duration-200"
          >
            تحديث
          </button>
          <button
            onClick={handleAddStudent}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-200"
          >
            + إضافة طالب جديد
          </button>
          <label
            htmlFor="file-upload"
            className="max-w-[200px] bg-indigo-600 text-white py-2 px-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-200 cursor-pointer flex items-center justify-center"
          >
            تحميل ملف طلاب
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-lg text-center">
          {error}
        </div>
      )}
      {uploadMessage && (
        <div
          className={`mb-4 p-3 text-sm font-medium text-center rounded-lg flex justify-between items-center ${
            uploadMessage.includes("نجاح") || (importResponse && importResponse.failedCount === 0)
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          <span>{uploadMessage}</span>
          {importResponse && importResponse.failedCount > 0 && (
            <button
              onClick={() => setShowErrorModal(true)}
              className="px-3 py-1 text-xs bg-white text-red-700 border border-red-700 rounded hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:border-red-300 dark:hover:bg-gray-700 transition"
            >
              عرض الأخطاء
            </button>
          )}
        </div>
      )}
      {deleteError && (
        <div className="mb-4 p-3 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-lg text-center">
          {deleteError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <span className="text-gray-600 dark:text-gray-400">
            جارٍ تحميل البيانات...
          </span>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-gray-600 dark:text-gray-400">
            لا توجد بيانات طلاب
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  رقم الجلوس
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الفرقة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  المعدل التراكمي
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentStudents.map((student) => (
                <tr
                  key={student.studentID}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {student.sittingNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {getLevelText(student.studentLevel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.gpa?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button
                      onClick={() =>
                        window.location.href = `/users/students/${student.studentID}/attendance?level=${student.studentLevel}`
                      }
                      className="text-green-600 cursor-pointer dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                    >
                      الغياب
                    </button>
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="text-indigo-600 cursor-pointer dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 w-[100px]"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => openDeleteModal(student.studentID)}
                      disabled={deletingId === student.studentID}
                      className={`text-red-600 cursor-pointer dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 ml-3 ${
                        deletingId === student.studentID
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {deletingId === student.studentID
                        ? "جاري الحذف..."
                        : "حذف"}
                    </button>
                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                      <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
                            تأكيد حذف الطالب
                          </h3>
                          <p className="mb-6 text-gray-700 dark:text-gray-300 text-center">
                            هل أنت متأكد أنك تريد حذف هذا الطالب؟ لا يمكن
                            التراجع عن هذا الإجراء.
                          </p>
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={closeDeleteModal}
                              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={() =>
                                studentToDelete && handleDelete(studentToDelete)
                              }
                              className="bg-red-600 w-[130px] max-w-[130px] hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200"
                              disabled={deletingId === studentToDelete}
                            >
                              {deletingId === studentToDelete
                                ? "جاري الحذف..."
                                : "تأكيد الحذف"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {students.length > 0 && (
        <div className="flex justify-between items-center mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            عرض {filteredStudents.length > 0 ? indexOfFirstItem + 1 : 0} إلى {Math.min(indexOfLastItem, filteredStudents.length)} من {filteredStudents.length} طالب
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              السابق
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 max-w-xl w-full mx-4 h-fit">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingStudent ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
              </h2>
              <button
                onClick={handleFormCancel}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <StudentForm
              student={editingStudent || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Import Errors Modal */}
      {showErrorModal && importResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                 أخطاء استيراد الملف ({importResponse.failedCount})
              </h3>
              <button
                onClick={() => setShowErrorModal(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase sticky top-0 bg-gray-50 dark:bg-gray-900">
                      الصف
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase sticky top-0 bg-gray-50 dark:bg-gray-900">
                      اسم الطالب
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase sticky top-0 bg-gray-50 dark:bg-gray-900">
                      سبب الخطأ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {importResponse.errors.map((err, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {err.rowNumber}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {err.studentName}
                      </td>
                      <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
                        {err.errorMessage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
