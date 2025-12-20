"use client";

import React, { useState } from "react";
import { Student, StudentPayload } from "@/actions/Student/types";

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: StudentPayload) => Promise<void>;
  onCancel: () => void;
}

export default function StudentForm({
  student,
  onSubmit,
  onCancel,
}: StudentFormProps) {
  const [formData, setFormData] = useState<StudentPayload>({
    studentID: student?.studentID || 0,
    gpa: student?.gpa || 0,
    enrollmentDate:
      student?.enrollmentDate?.split("T")[0] ||
      new Date().toISOString().split("T")[0],
    studentLevel: student?.studentLevel || "الاول",
    totalGrades: student?.totalGrades || 0,
    sittingNumber: student?.sittingNumber || "",
    parentPhone: student?.parentPhone || "",
    address: student?.address || "",
    notes: student?.notes || "",
    guidanceGroupID: student?.guidanceGroupID || 1,
    user: {
      id: student?.user?.id || 0,
      name: student?.user?.name || "",
      email: student?.user?.email || "",
      password: "",
      confirmPassword: "",
      phone: student?.user?.phone || "",
      nationalNo: student?.user?.nationalNo || "",
      roleId: 1,
    },
  });
console.log("hello")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء حفظ البيانات"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("user.")) {
      const userField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [userField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "gpa" ||
          name === "totalGrades" ||
          name === "guidanceGroupID" ||
          name === "studentID"
            ? Number(value)
            : value,
      }));
    }
  };

  const validatePhone = (phone: string) => {
    return /^01[0-2,5]{1}[0-9]{8}$/.test(phone);
  };

  const validateParentPhone = (phone: string) => {
    return /^[0-9]{11}$/.test(phone);
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-5 gap-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              الاسم الكامل
            </label>
            <input
              type="text"
              name="user.name"
              value={formData.user.name}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              name="user.email"
              value={formData.user.email}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              name="user.password"
              value={formData.user.password}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={!student}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              تأكيد كلمة المرور{" "}
            </label>
            <input
              type="password"
              name="user.confirmPassword"
              value={formData.user.confirmPassword}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={!student}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              رقم الهاتف
            </label>
            <input
              type="tel"
              name="user.phone"
              value={formData.user.phone}
              onChange={handleInputChange}
              pattern="^01[0-2,5]{1}[0-9]{8}$"
              placeholder="01xxxxxxxxx"
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {formData.user.phone && !validatePhone(formData.user.phone) && (
              <p className="text-xs text-red-600 mt-1">رقم هاتف غير صحيح</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              الرقم القومي
            </label>
            <input
              type="text"
              name="user.nationalNo"
              value={formData.user.nationalNo}
              onChange={handleInputChange}
              pattern="[0-9]{14}"
              maxLength={14}
              placeholder="14 رقم"
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              رقم جلوس
            </label>
            <input
              type="text"
              name="sittingNumber"
              value={formData.sittingNumber}
              onChange={handleInputChange}
              pattern="[0-9]{5}"
              maxLength={5}
              placeholder="5 أرقام"
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              تاريخ التسجيل
            </label>
            <input
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              الفرقة الدراسية
            </label>
            <select
              name="studentLevel"
              value={formData.studentLevel}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="الاول">الأول</option>
              <option value="الثانى">الثاني</option>
              <option value="الثالث">الثالث</option>
              <option value="الرابع">الرابع</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              المعدل التراكمي (GPA)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              name="gpa"
              value={formData.gpa}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              مجموع الدرجات
            </label>
            <input
              type="number"
              min="0"
              max="4800"
              name="totalGrades"
              value={formData.totalGrades}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              رقم هاتف ولي الأمر
            </label>
            <input
              type="tel"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleInputChange}
              pattern="[0-9]{11}"
              maxLength={11}
              placeholder="11 رقم"
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {formData.parentPhone &&
              !validateParentPhone(formData.parentPhone) && (
                <p className="text-xs text-red-600 mt-1">رقم هاتف غير صحيح</p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              مجموعة الإرشاد
            </label>
            <input
              type="number"
              name="guidanceGroupID"
              value={formData.guidanceGroupID}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              العنوان
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              ملاحظات
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="text-black dark:text-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "جاري الحفظ..." : student ? "تحديث" : "حفظ"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 dark:text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            إلغاء
          </button>
        </div>
      </form>
    </>
  );
}
