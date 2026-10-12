
import "server-only";

import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Cloudinary configuration is missing. Check your .env file."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function uploadProductImage(
  file: File,
  productId?: string
): Promise<{ url: string; publicId: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }

  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // Use a fixed folder and a generated public ID.
  // Never let the client choose an arbitrary Cloudinary path.
  const folder = productId
    ? `sokostyle/products/${productId}`
    : "sokostyle/products";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
          {
            width: 1600,
            height: 1600,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error("Image upload failed. Please try again."));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(bytes);
  });
}

export async function deleteCloudinaryImage(
  publicId: string
): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Could not remove the hosted image.");
  }
}
