import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "../../actions";
import VariantEditor from "./variant-editor";
import ProductImageUpload from "@/components/ProductImageUpload";
import EditSubmitButton from "./edit-submit-button";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

const inputClass =
  "w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-sm text-stone-900 dark:text-stone-100 outline-none transition placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:border-[#788568] focus:ring-2 focus:ring-[#788568]/20 dark:focus:border-[#8da47a] dark:focus:ring-[#8da47a]/20";
const labelClass = "mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300";

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
    },
  });

  if (!product) notFound();

  const errorMessages: Record<string, string> = {
    InvalidInput: "Please check the product details and variant values.",
    DuplicateVariants: "Each size and color combination must be unique.",
    SaveFailed: "The product could not be saved. Please try again.",
  };

  return (
    <div className="px-6 py-8 md:px-10">
      {/* Header */}
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-stone-500 dark:text-stone-400 hover:text-[#263b2d] dark:hover:text-stone-100 transition"
        >
          ← Back to products
        </Link>

        <header className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#788568] dark:text-[#8da47a]">
            Inventory management
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#263b2d] dark:text-stone-100">
            Edit product
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Update details, price, image, sizes, colors, and stock.
          </p>
        </header>
      </div>

      {query.error && errorMessages[query.error] && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300"
        >
          {errorMessages[query.error]}
        </div>
      )}

      <form
        action={updateProduct}
        className="mt-8 max-w-3xl space-y-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1e1b] p-6 shadow-sm sm:p-8"
      >
        <input type="hidden" name="id" value={product.id} />

        {/* Product name */}
        <div>
          <label htmlFor="name" className={labelClass}>
            Product name *
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={120}
            defaultValue={product.name}
            className={inputClass}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className={labelClass}>
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={product.category}
            className={inputClass}
          >
            <option value="Shoes">Shoes</option>
            <option value="Clothing">Clothing</option>
            <option value="Bags">Bags</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className={labelClass}>
            Price (RWF) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            max={100_000_000}
            step={1}
            required
            defaultValue={product.price}
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            defaultValue={product.description ?? ""}
            className={`${inputClass} resize-y`}
          />
        </div>

        {/* Product image */}
        <section className="border-t border-stone-100 dark:border-stone-800 pt-6">
          <h2 className="font-semibold text-[#263b2d] dark:text-stone-100">Product image</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Upload a new photo to replace the current image, or leave as-is.
          </p>
          <div className="mt-4">
            <ProductImageUpload currentImageUrl={product.images[0]?.imageUrl ?? ""} />
          </div>

          <label htmlFor="imageAlt" className={`${labelClass} mt-5`}>
            Image description
          </label>
          <input
            id="imageAlt"
            name="imageAlt"
            maxLength={200}
            defaultValue={product.images[0]?.alt ?? ""}
            placeholder="Describe the product image"
            className={inputClass}
          />
        </section>

        {/* Variants */}
        <section className="border-t border-stone-100 dark:border-stone-800 pt-6">
          <h2 className="font-semibold text-[#263b2d] dark:text-stone-100">
            Sizes, colors and stock
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Edit existing variants, remove unwanted ones, or add new combinations.
          </p>
          <VariantEditor
            initialVariants={product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              stock: v.stock,
            }))}
          />
        </section>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3 border-t border-stone-100 dark:border-stone-800 pt-6">
          <Link
            href="/admin/products"
            className="rounded-xl border border-stone-300 dark:border-stone-700 px-5 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 transition hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            Cancel
          </Link>
          <EditSubmitButton />
        </div>
      </form>
    </div>
  );
}
