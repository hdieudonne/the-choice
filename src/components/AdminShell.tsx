"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

type AdminShellProps = {
  adminName: string;
  adminEmail: string;
  children: React.ReactNode;
};

export default function AdminShell({ adminName, adminEmail, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when viewport grows to desktop size
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll while mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf9f6] dark:bg-[#111210]">
      {/* ── Desktop sidebar (always visible on md+) ──────────────────────── */}
      <div className="hidden md:flex md:flex-shrink-0">
        <AdminSidebar adminName={adminName} adminEmail={adminEmail} />
      </div>

      {/* ── Mobile sidebar overlay ────────────────────────────────────────── */}
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          adminName={adminName}
          adminEmail={adminEmail}
          onClose={closeSidebar}
        />
      </div>

      {/* ── Right-hand content column ─────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top-bar (hidden on desktop) */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141614] px-4 md:hidden">
          <button
            type="button"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-lg p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <span className="text-sm font-bold tracking-[-0.04em] text-[#263b2d] dark:text-[#8da47a]">
            THE CHOICE<span className="text-[#788568] dark:text-[#6b8a5a]">.</span>
          </span>

          <span className="rounded-full bg-[#263b2d]/10 dark:bg-[#3a5543]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#263b2d] dark:text-[#8da47a]">
            Admin
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
