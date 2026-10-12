"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

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

  // Keep in sync when the prop changes (edit page re-render)
  useEffect(() => {
    if (!uploading) {
      setPreview(currentImageUrl);
      setUploadedUrl(currentImageUrl);
    }
  }, [currentImageUrl, uploading]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError("");
    setUploading(true);
    setUploadedUrl("");

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Upload failed.");
      }

      setUploadedUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
      setPreview(currentImageUrl);
      setUploadedUrl(currentImageUrl);
      // Reset file input
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
    <div className="space-y-4">
      {/* Hidden field that goes to the server action */}
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
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/50">
                <Loader2 size={24} className="animate-spin text-white" />
                <p className="mt-2 text-xs text-white">Uploading…</p>
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
            <p className="text-xs">No image</p>
          </div>
        )}
      </div>

      {/* Upload status */}
      {uploading && (
        <p className="flex items-center gap-2 text-xs text-[#788568] dark:text-[#8da47a]">
          <Loader2 size={13} className="animate-spin" />
          Uploading to cloud…
        </p>
      )}

      {!uploading && uploadedUrl && uploadedUrl !== currentImageUrl && (
        <p className="text-xs text-green-700 dark:text-green-400">
          ✓ Image uploaded successfully
        </p>
      )}

      {/* Error */}
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
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
          JPEG, PNG, or WebP · Max 5 MB · Automatically uploaded to cloud
        </p>
      </div>
    </div>
  );
}
