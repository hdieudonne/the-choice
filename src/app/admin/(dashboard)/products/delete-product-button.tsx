"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "./actions";
import { Loader2 } from "lucide-react";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.append("id", productId);
    formData.append("confirmation", "DELETE");
    startTransition(() => deleteProduct(formData));
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Deleting…
            </>
          ) : (
            "Confirm delete"
          )}
        </button>

        {!isPending && (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-stone-500 dark:text-stone-400 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${productName}`}
      className="font-medium text-red-600 dark:text-red-400 hover:underline"
    >
      Delete
    </button>
  );
}
