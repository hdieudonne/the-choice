import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleProductStatus, deleteProduct } from "./actions";
import DeleteProductButton from "./delete-product-button";

type ProductsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps) {
  const query = await searchParams;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
  });

  const successMessages: Record<string, string> = {
    created: "Product created successfully.",
    updated: "Product updated successfully.",
    statusUpdated: "Product status updated.",
    deleted: "Product permanently deleted.",
  };

  const errorMessages: Record<string, string> = {
    InvalidInput: "The request was invalid. Please try again.",
    NotFound: "The requested product could not be found.",
  };

  return (
    <div className="px-6 py-8 md:px-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#788568] dark:text-[#8da47a]">
            Inventory management
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#263b2d] dark:text-stone-100">
            Products
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {products.length} product{products.length !== 1 ? "s" : ""} in your catalog
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 justify-center rounded-xl bg-[#263b2d] dark:bg-[#3a5543] px-5 py-3 text-sm font-medium text-white hover:bg-[#354d3c] dark:hover:bg-[#4a6852] transition-colors shadow-sm"
        >
          + Add product
        </Link>
      </div>

      {/* Notifications */}
      {query.success && successMessages[query.success] && (
        <div
          role="status"
          className="mt-5 flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-800 dark:text-green-300"
        >
          <span>✓</span>
          {successMessages[query.success]}
        </div>
      )}

      {query.error && errorMessages[query.error] && (
        <div
          role="alert"
          className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          <span>⚠</span>
          {errorMessages[query.error]}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1e1b] shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
            <tr>
              <th className="px-5 py-4 font-medium">Product</th>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium">Price</th>
              <th className="px-5 py-4 font-medium">Stock</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + v.stock,
                0
              );

              return (
                <tr
                  key={product.id}
                  className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.images[0]?.imageUrl ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.images[0].alt ?? product.name}
                          className="h-11 w-11 flex-shrink-0 rounded-xl border border-stone-200 dark:border-stone-700 object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-400 dark:text-stone-500">
                          —
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone-900 dark:text-stone-100">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                          {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-stone-600 dark:text-stone-400">
                    {product.category}
                  </td>

                  <td className="px-5 py-4 font-medium text-stone-800 dark:text-stone-200">
                    RWF {product.price.toLocaleString("en-RW")}
                  </td>

                  <td className="px-5 py-4">
                    <span className={`font-medium ${
                      totalStock === 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-stone-700 dark:text-stone-300"
                    }`}>
                      {totalStock}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.isActive
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                      }`}
                    >
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-stone-400"}`} />
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-medium text-[#526747] dark:text-[#8da47a] hover:underline"
                      >
                        Edit
                      </Link>

                      <form action={toggleProductStatus}>
                        <input type="hidden" name="id" value={product.id} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={String(!product.isActive)}
                        />
                        <button
                          type="submit"
                          className="font-medium text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          {product.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </form>

                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-14 text-center text-stone-500 dark:text-stone-400"
                >
                  <div className="space-y-3">
                    <p className="text-base font-medium">No products yet</p>
                    <p className="text-sm">Start by adding your first product to the catalog.</p>
                    <Link
                      href="/admin/products/new"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#263b2d] dark:bg-[#3a5543] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#354d3c] transition-colors"
                    >
                      + Add product
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
