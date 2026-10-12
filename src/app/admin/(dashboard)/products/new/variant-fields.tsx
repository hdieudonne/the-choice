"use client";

import { useState } from "react";

type Variant = {
  size: string;
  color: string;
  stock: number;
};

export default function VariantFields() {
  const [variants, setVariants] = useState<Variant[]>([
    { size: "", color: "", stock: 0 },
  ]);

  function updateVariant(
    index: number,
    field: keyof Variant,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index
          ? {
              ...variant,
              [field]: field === "stock" ? Number(value) : value,
            }
          : variant
      )
    );
  }

  function addVariant() {
    if (variants.length >= 100) return;

    setVariants((current) => [
      ...current,
      { size: "", color: "", stock: 0 },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  const completedVariants = variants.filter(
    (variant) => variant.size.trim() && variant.color.trim()
  );

  return (
    <div className="mt-5 space-y-4">
      {/* Send completed variants to the server action */}
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(
          completedVariants.map((variant) => ({
            size: variant.size.trim(),
            color: variant.color.trim(),
            stock: variant.stock,
          }))
        )}
      />

      {variants.map((variant, index) => (
        <div
          key={index}
          className="grid gap-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 p-4 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end"
        >
          <div>
            <label
              htmlFor={`variant-size-${index}`}
              className="mb-2 block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Size
            </label>

            <input
              id={`variant-size-${index}`}
              type="text"
              value={variant.size}
              onChange={(event) =>
                updateVariant(index, "size", event.target.value)
              }
              maxLength={30}
              placeholder="e.g. 40, M, XL"
              className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none transition focus:border-[#788568] dark:focus:border-[#8da47a]"
            />
          </div>

          <div>
            <label
              htmlFor={`variant-color-${index}`}
              className="mb-2 block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Color
            </label>

            <input
              id={`variant-color-${index}`}
              type="text"
              value={variant.color}
              onChange={(event) =>
                updateVariant(index, "color", event.target.value)
              }
              maxLength={50}
              placeholder="e.g. White"
              className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none transition focus:border-[#788568] dark:focus:border-[#8da47a]"
            />
          </div>

          <div>
            <label
              htmlFor={`variant-stock-${index}`}
              className="mb-2 block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Stock
            </label>

            <input
              id={`variant-stock-${index}`}
              type="number"
              min={0}
              max={1_000_000}
              step={1}
              value={variant.stock}
              onChange={(event) =>
                updateVariant(index, "stock", event.target.value)
              }
              className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none transition focus:border-[#788568] dark:focus:border-[#8da47a]"
            />
          </div>

          <button
            type="button"
            onClick={() => removeVariant(index)}
            disabled={variants.length === 1}
            className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-600 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Remove variant ${index + 1}`}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addVariant}
          disabled={variants.length >= 100}
          className="rounded-lg border border-[#788568] dark:border-[#4a6852] px-4 py-2.5 text-sm font-medium text-[#263b2d] dark:text-[#8da47a] transition hover:bg-stone-50 dark:hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add size/color
        </button>

        <p className="text-xs text-stone-400 dark:text-stone-500">
          {completedVariants.length} completed{" "}
          {completedVariants.length === 1 ? "variant" : "variants"}
        </p>
      </div>
    </div>
  );
}
