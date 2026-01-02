"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Calendar,
  ClipboardList,
} from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import { ThemeContext } from "@/context/ThemeContext";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { decodeJwt } from "@/lib/auth";
import { UserRole } from "@/types/auth";

interface Tab {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: Tab[];
}

export default function SharedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useContext(ThemeContext);
  const pathname = usePathname();
  const [isUsersOpen, setIsUsersOpen] = useState(pathname.startsWith("/users"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // setMounted(true);
    const token = localStorage.getItem("authToken");
    if (token) {
      const claims = decodeJwt(token);
      if (claims) {
        setUserRole(claims.role);
      }
    }

    const handleResize = () => setIsMobile(window.innerWidth < 980);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tabs: Tab[] = [
    ...(userRole === "Student"
      ? [
          { href: "/student/dashboard", label: "لوحة الطالب", icon: LayoutDashboard },
          { href: "/student/schedule", label: "الجدول الدراسي", icon: Calendar },
          { href: "/student/notifications", label: "الإشعارات", icon: Calendar }, // Using Calendar icon as placeholder, ideally Bell
        ]
      : [
          { href: "/overview", label: "نظرة عامة", icon: LayoutDashboard },
          {
            href: "/users",
            label: "إدارة المستخدمين",
            icon: Users,
            children: [
              { href: "/users/students", label: "الطلاب", icon: Users },
              { href: "/users/instructors", label: "المحاضرون", icon: Users },
              { href: "/users/employees", label: "الموظفون", icon: Users },
              { href: "/users/managers", label: "أعضاء الإدارة", icon: Users },
            ],
          },
          { href: "/schedule", label: "الجدول الدراسي", icon: Calendar },
          {
            href: "/attendance-management",
            label: "إدارة الغياب",
            icon: ClipboardList,
          },
          { href: "/settings", label: "الإعدادات", icon: Settings },
        ]),
  ];

  const isActive = (href: string) =>
    pathname === href || (pathname.startsWith(href) && href !== "/");

  const clientSideRedirect = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.replace(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    clientSideRedirect("/");
  };

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      } flex min-h-screen relative`}
      dir="rtl"
    >
      {isMobile && (
        <button
          className="fixed top-4 right-4 z-30 bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-3 rounded-lg shadow-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={22} />
        </button>
      )}

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <motion.aside
        initial={{ x: isMobile ? 300 : 0 }}
        animate={{ x: isMobile && !isSidebarOpen ? 300 : 0 }}
        transition={{ duration: 0.4 }}
        className={`w-64 ${
          theme === "dark"
            ? "bg-gray-900/90 text-gray-200 border-gray-700"
            : "bg-white/90 text-slate-800 border-slate-200"
        } backdrop-blur-md flex flex-col justify-between shadow-2xl fixed top-0 right-0 h-full z-30 ${
          isMobile ? "rounded-l-2xl" : ""
        }`}
      >
        <div>
          <div
            className={`${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-gradient-to-r from-green-500 to-blue-500 text-white border-slate-200"
            } p-6 flex justify-between items-center rounded-tl-2xl`}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/faculty-logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full shadow-md border border-white/50"
              />
              <h1 className="text-2xl font-bold tracking-wide">لوحة التحكم</h1>
              <ThemeSwitch />
            </div>

            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                <X size={22} />
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-2 p-4">
            {tabs.map((tab) => (
              <React.Fragment key={tab.href}>
                {tab.children ? (
                  <div key={tab.href} className="flex flex-col">
                    <button
                      onClick={() => setIsUsersOpen(!isUsersOpen)}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-right font-medium transition-all duration-300 ${
                        isUsersOpen
                          ? theme === "dark"
                            ? "bg-emerald-900/40 text-emerald-300"
                            : "bg-emerald-100 text-emerald-800"
                          : theme === "dark"
                          ? "text-slate-300 hover:bg-emerald-900/20 hover:text-emerald-300"
                          : "text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
                      } w-full`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon size={20} />
                        {tab.label}
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${
                          isUsersOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isUsersOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-1 pr-8 py-1 overflow-hidden"
                      >
                        {tab.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              isActive(child.href)
                                ? theme === "dark"
                                  ? "bg-emerald-900/40 text-emerald-300 font-semibold"
                                  : "bg-emerald-200 text-emerald-900 font-semibold"
                                : theme === "dark"
                                ? "text-slate-300 hover:bg-emerald-900/20 hover:text-emerald-300"
                                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-right font-medium transition-all duration-300 ${
                      isActive(tab.href)
                        ? theme === "dark"
                          ? "bg-emerald-900/40 text-emerald-300"
                          : "bg-emerald-100 text-emerald-800"
                        : theme === "dark"
                        ? "text-slate-300 hover:bg-emerald-900/20 hover:text-emerald-300"
                        : "hover:bg-emerald-50 hover:text-emerald-700 text-slate-800"
                    }`}
                  >
                    <tab.icon size={20} />
                    {tab.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className={`flex items-center justify-center gap-2 py-3 mx-4 mb-5 rounded-lg font-semibold shadow-md transition-all duration-300 ${
            theme === "dark"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </motion.aside>

      <main
        className={`overflow-x-auto flex-1 p-4 md:p-8 rounded-3xl shadow-inner m-2 transition-all duration-300 ${
          isMobile ? "mr-0" : "mr-72"
        } ${
          theme === "dark"
            ? "bg-gray-800/70 text-gray-100"
            : "bg-white/70 text-gray-900"
        } backdrop-blur-sm`}
        style={{
          backgroundImage: `url('/cover2.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {children}
      </main>
    </div>
  );
}
