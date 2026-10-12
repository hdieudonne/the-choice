"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import {
  LayoutDashboard,
  Package,
  Store,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
];

type AdminSidebarProps = {
  adminName: string;
  adminEmail: string;
};

export default function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141614]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-stone-200 dark:border-stone-800 px-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img
            src="/logo.svg"
            alt="The Choice Style logo"
            className="h-8 w-8 rounded-lg object-contain shadow-xs"
          />
          <span className="text-lg font-black tracking-[-0.05em] text-[#263b2d] dark:text-[#8da47a]">
            THE CHOICE<span className="text-[#788568] dark:text-[#6b8a5a]">.</span>
          </span>
        </Link>
        <span className="ml-2 rounded-full bg-[#263b2d]/10 dark:bg-[#3a5543]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#263b2d] dark:text-[#8da47a]">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#263b2d] dark:bg-[#3a5543] text-white"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Icon size={18} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
            </Link>
          );
        })}

        <div className="my-2 border-t border-stone-100 dark:border-stone-800" />

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <Store size={18} />
          View Storefront
        </Link>
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-stone-200 dark:border-stone-800 p-3 space-y-1">
        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>

        {/* Admin info */}
        <div className="mt-2 rounded-lg bg-stone-50 dark:bg-stone-800/50 px-3 py-2.5">
          <p className="truncate text-xs font-medium text-stone-800 dark:text-stone-200">
            {adminName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-stone-500 dark:text-stone-500">
            {adminEmail}
          </p>
        </div>
      </div>
    </aside>
  );
}
