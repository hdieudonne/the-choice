"use client";

import { useState } from "react";

export type EditableVariant = {
  id?: string;
  size: string;
  color: string;
  stock: number;
};

export default function VariantEditor({
  initialVariants,
}: {
  initialVariants: EditableVariant[];
}) {
  const [variants, setVariants] =
    useState<EditableVariant[]>(initialVariants);

  function updateVariant(
    index: number,
    field: keyof EditableVariant,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index
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
      current.filter((_, i) => i !== index)
    );
  }

  const completedVariants = variants.filter(
    (variant) => variant.size.trim() && variant.color.trim()
  );

  return (
    <div className="mt-5 space-y-4">
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(
          completedVariants.map((variant) => ({
            ...variant,
            size: variant.size.trim(),
            color: variant.color.trim(),
          }))
        )}
      />

      {variants.map((variant, index) => (
        <div
          key={variant.id ?? `new-${index}`}
          className="grid gap-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 p-4 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end"
        >
          <div>
            <label
              htmlFor={`size-${index}`}
              className="mb-2 block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Size
            </label>
            <input
              id={`size-${index}`}
              value={variant.size}
              maxLength={30}
              onChange={(event) =>
                updateVariant(index, "size", event.target.value)
              }
              className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-[#788568] dark:focus:border-[#8da47a]"
            />
          </div>

          <div>
            <label
              htmlFor={`color-${index}`}
              className="mb-2 block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Color
            </label>
            <input
              id={`color-${index}`}
              value={variant.color}
              maxLength={50}
              onChange={(event) =>
                updateVariant(index, "color", event.target.value)
              }
              className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-[#788568] dark:focus:border-[#8da47a]"
            />
          </div>

          <div>
            <label
              htmlFor={`stock-${index}`}
              className="mb-2 block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Stock
            </label>
            <input
              id={`stock-${index}`}
              type="number"
              min={0}
              max={1_000_000}
              step={1}
              value={variant.stock}
              onChange={(event) =>
                updateVariant(index, "stock", event.target.value)
              }
              className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-[#788568] dark:focus:border-[#8da47a]"
            />
          </div>

          <button
            type="button"
            onClick={() => removeVariant(index)}
            className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addVariant}
        disabled={variants.length >= 100}
        className="rounded-lg border border-[#788568] dark:border-[#4a6852] px-4 py-2.5 text-sm font-medium text-[#263b2d] dark:text-[#8da47a] hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40"
      >
        + Add size/color
      </button>

      <p className="text-xs text-stone-400 dark:text-stone-500">
        {completedVariants.length} completed variants
      </p>
    </div>
  );
}
