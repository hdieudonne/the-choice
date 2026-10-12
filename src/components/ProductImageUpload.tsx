"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Upload, X } from "lucide-react";

type ProductImageUploadProps = {
  currentImageUrl?: string;
};

export default function ProductImageUpload({
  currentImageUrl = "",
}: ProductImageUploadProps) {
  const [preview, setPreview] = useState(currentImageUrl);
  const [uploadedUrl, setUploadedUrl] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep in sync when the prop changes (edit page re-render)
  useEffect(() => {
    if (!uploading) {
      setPreview(currentImageUrl);
      setUploadedUrl(currentImageUrl);
    }
  }, [currentImageUrl, uploading]);

  // Prevent submitting the parent form while image is uploading
  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return;

    function handleSubmit(e: SubmitEvent) {
      if (uploading) {
        e.preventDefault();
        e.stopPropagation();
        setError("Please wait until image upload finishes before saving.");
      }
    }

    form.addEventListener("submit", handleSubmit, true);
    return () => {
      form.removeEventListener("submit", handleSubmit, true);
    };
  }, [uploading]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError("");
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok || data.error || !data.url) {
        throw new Error(data.error ?? "Upload failed.");
      }

      setUploadedUrl(data.url);
      setPreview(data.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed. Try again.";
      setError(msg);
      setPreview(currentImageUrl);
      setUploadedUrl(currentImageUrl);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  function clearImage() {
    setPreview("");
    setUploadedUrl("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Hidden field that sends imageUrl to the server action */}
      <input type="hidden" name="imageUrl" value={uploadedUrl} />

      {/* Preview area */}
      <div className="relative h-48 w-48">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Product preview"
              className="h-48 w-48 rounded-xl border border-stone-200 dark:border-stone-700 object-cover"
            />
            {/* Uploading overlay */}
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/60 backdrop-blur-xs">
                <Loader2 size={26} className="animate-spin text-white" />
                <p className="mt-2 text-xs font-medium text-white">Uploading to Cloudinary…</p>
              </div>
            )}
            {/* Clear button (only when not uploading) */}
            {!uploading && (
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove image"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
              >
                <X size={12} />
              </button>
            )}
          </>
        ) : (
          <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/50 text-stone-400 dark:text-stone-500">
            <Upload size={24} />
            <p className="text-xs">No image selected</p>
          </div>
        )}
      </div>

      {/* Upload in progress banner */}
      {uploading && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Loader2 size={14} className="animate-spin" />
          <span>Uploading to cloud. Please wait before saving the product…</span>
        </div>
      )}

      {/* Upload success message */}
      {!uploading && uploadedUrl && uploadedUrl !== currentImageUrl && (
        <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 font-medium">
          <CheckCircle2 size={14} />
          <span>Image ready! Cloud URL is attached to this product.</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* File picker */}
      <div>
        <label
          htmlFor="imageFile"
          className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          {currentImageUrl ? "Replace product image" : "Choose product image"}
        </label>

        <input
          ref={inputRef}
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={handleFileChange}
          className="block w-full max-w-md text-sm text-stone-600 dark:text-stone-400
            file:mr-4 file:rounded-lg file:border-0 file:bg-[#263b2d] dark:file:bg-[#3a5543]
            file:px-4 file:py-2.5 file:font-medium file:text-white
            hover:file:bg-[#354d3c] dark:hover:file:bg-[#4a6852]
            disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-2 text-xs text-stone-500 dark:text-stone-500">
          JPEG, PNG, or WebP · Max 5 MB · Automatically uploaded to Cloudinary
        </p>
      </div>

      {/* Optional fallback direct URL input in case user already has a Cloudinary URL */}
      <div className="pt-2">
        <label
          htmlFor="directImageUrl"
          className="mb-1 block text-xs text-stone-500 dark:text-stone-400"
        >
          Or paste image URL directly:
        </label>
        <input
          id="directImageUrl"
          type="url"
          value={uploadedUrl}
          onChange={(e) => {
            const url = e.target.value.trim();
            setUploadedUrl(url);
            setPreview(url);
          }}
          placeholder="https://res.cloudinary.com/..."
          className="block w-full max-w-md rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-[#788568] dark:focus:border-[#8da47a]"
        />
      </div>
    </div>
  );
}

