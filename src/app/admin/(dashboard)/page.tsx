import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, PackageCheck, PackageX, AlertTriangle, Plus, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    redirect("/admin/login");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    select: { name: true, email: true, isActive: true },
  });

  if (!admin?.isActive) {
    redirect("/admin/login?error=SessionExpired");
  }

  const [totalProducts, activeProducts, inactiveProducts, outOfStockCount, recentProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),
      prisma.productVariant.count({ where: { stock: 0 } }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          variants: true,
        },
      }),
    ]);

  const stats = [
    {
      label: "Total products",
      value: totalProducts,
      icon: Package,
      color: "text-[#263b2d] dark:text-[#8da47a]",
      bg: "bg-[#263b2d]/10 dark:bg-[#3a5543]/30",
    },
    {
      label: "Active",
      value: activeProducts,
      icon: PackageCheck,
      color: "text-green-700 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Inactive",
      value: inactiveProducts,
      icon: PackageX,
      color: "text-stone-600 dark:text-stone-400",
      bg: "bg-stone-100 dark:bg-stone-800/50",
    },
    {
      label: "Out-of-stock variants",
      value: outOfStockCount,
      icon: AlertTriangle,
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="px-6 py-8 md:px-10">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#788568] dark:text-[#8da47a]">
          The Choice Style Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#263b2d] dark:text-stone-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Welcome back, {admin.name} 👋
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1e1b] p-5 shadow-sm"
          >
            <div className={`mb-4 inline-flex rounded-xl p-2.5 ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">
              {value}
            </p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/products/new"
          className="group flex items-center justify-between rounded-2xl border border-dashed border-[#788568] dark:border-[#4a6852] bg-[#263b2d]/5 dark:bg-[#3a5543]/10 p-6 transition hover:bg-[#263b2d]/10 dark:hover:bg-[#3a5543]/20"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#263b2d] dark:bg-[#3a5543] text-white">
              <Plus size={22} />
            </div>
            <div>
              <p className="font-semibold text-[#263b2d] dark:text-stone-100">Add a product</p>
              <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                Create a new listing with images and variants
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-stone-400 transition group-hover:translate-x-1" />
        </Link>

        <Link
          href="/admin/products"
          className="group flex items-center justify-between rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1e1b] p-6 shadow-sm transition hover:border-[#788568] dark:hover:border-[#4a6852]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              <Package size={22} />
            </div>
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">Manage products</p>
              <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                Edit prices, stock, visibility and images
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-stone-400 transition group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Recent products */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Recent products
          </h2>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-[#788568] dark:text-[#8da47a] hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1e1b] shadow-sm">
          {recentProducts.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-stone-500 dark:text-stone-400">
              No products yet.{" "}
              <Link href="/admin/products/new" className="font-medium text-[#788568] hover:underline">
                Add your first product
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {recentProducts.map((product) => {
                const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <li key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
                    {product.images[0]?.imageUrl ? (
                      <img
                        src={product.images[0].imageUrl}
                        alt={product.name}
                        className="h-12 w-12 flex-shrink-0 rounded-xl border border-stone-200 dark:border-stone-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-400">
                        —
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-stone-900 dark:text-stone-100">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                        {product.category} · {product.variants.length} variants · RWF {product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.isActive
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                      }`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                      {totalStock === 0 && (
                        <span className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                          Out of stock
                        </span>
                      )}
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs font-medium text-[#788568] dark:text-[#8da47a] hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
