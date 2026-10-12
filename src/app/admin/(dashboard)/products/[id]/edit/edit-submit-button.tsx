"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export default function EditSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-[#263b2d] dark:bg-[#3a5543] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#354d3c] dark:hover:bg-[#4a6852] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}
