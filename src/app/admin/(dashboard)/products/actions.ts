
"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

const variantSchema = z.object({
  size: z.string().trim().min(1).max(30),
  color: z.string().trim().min(1).max(50),
  stock: z.number().int().min(0).max(1_000_000),
});

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  category: z.string().trim().min(2).max(60),
  price: z.number().int().positive().max(100_000_000),
  imageUrl: z
    .string()
    .trim()
    .max(2000)
    .url()
    .or(z.literal("")),
  imageAlt: z.string().trim().max(200),
  variants: z.array(variantSchema).max(100),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    redirect("/admin/login");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    select: { isActive: true },
  });

  if (!admin?.isActive) {
    redirect("/admin/login?error=SessionExpired");
  }
}

function createSlug(name: string) {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 90) || "product";

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const rawPrice = String(formData.get("price") ?? "");
  const rawVariants = String(formData.get("variants") ?? "[]");

  let variants: unknown;

  try {
    variants = JSON.parse(rawVariants);
  } catch {
    redirect("/admin/products/new?error=InvalidInput");
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    category: formData.get("category"),
    price: Number(rawPrice),
    imageUrl: formData.get("imageUrl") ?? "",
    imageAlt: formData.get("imageAlt") ?? "",
    variants,
  });

  if (!parsed.success) {
    redirect("/admin/products/new?error=InvalidInput");
  }

  const {
    name,
    description,
    category,
    price,
    imageUrl,
    imageAlt,
  } = parsed.data;

  // Prevent duplicate size/color combinations.
  const combinationKeys = parsed.data.variants.map(
    (variant) =>
      `${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`
  );

  if (new Set(combinationKeys).size !== combinationKeys.length) {
    redirect("/admin/products/new?error=DuplicateVariants");
  }

  console.log(`[createProduct] Raw imageUrl received from form:`, JSON.stringify(imageUrl));

  try {
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug: createSlug(name),
          description: description || null,
          category,
          price,
          variants: {
            create: parsed.data.variants,
          },
        },
      });

      if (imageUrl && imageUrl.trim().length > 0) {
        console.log(`[createProduct] Inserting ProductImage record for product ${newProduct.id}:`, imageUrl);
        await tx.productImage.create({
          data: {
            productId: newProduct.id,
            imageUrl: imageUrl.trim(),
            alt: imageAlt || name,
            sortOrder: 0,
          },
        });
      } else {
        console.warn(`[createProduct] No imageUrl provided for product "${name}". Skipping ProductImage insertion.`);
      }

      return newProduct;
    });

    console.log(`[createProduct] Successfully created product ${product.id}`);
  } catch (error) {
    console.error("Failed to create product:", error);
    redirect("/admin/products/new?error=SaveFailed");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect("/admin/products?success=created");
}




const updateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  category: z.string().trim().min(2).max(60),
  price: z.number().int().positive().max(100_000_000),
  imageUrl: z.string().trim().max(2000).url().or(z.literal("")),
  imageAlt: z.string().trim().max(200),
  variants: z.array(
    z.object({
      id: z.string().optional(),
      size: z.string().trim().min(1).max(30),
      color: z.string().trim().min(1).max(50),
      stock: z.number().int().min(0).max(1_000_000),
    })
  ).max(100),
});

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  let variants: unknown;

  try {
    variants = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    redirect(
      `/admin/products/${encodeURIComponent(String(formData.get("id") ?? ""))}/edit?error=InvalidInput`
    );
  }

  const parsed = updateProductSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    category: formData.get("category"),
    price: Number(formData.get("price")),
    imageUrl: formData.get("imageUrl") ?? "",
    imageAlt: formData.get("imageAlt") ?? "",
    variants,
  });

  const productId = String(formData.get("id") ?? "");

  if (!parsed.success) {
    redirect(
      `/admin/products/${encodeURIComponent(productId)}/edit?error=InvalidInput`
    );
  }

  const {
    id,
    name,
    description,
    category,
    price,
    imageUrl,
    imageAlt,
  } = parsed.data;

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, images: true },
  });

  if (!existingProduct) {
    redirect("/admin/products?error=NotFound");
  }

  // Prevent duplicate size/color combinations.
  const combinationKeys = parsed.data.variants.map(
    (variant) =>
      `${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`
  );

  if (new Set(combinationKeys).size !== combinationKeys.length) {
    redirect(
      `/admin/products/${encodeURIComponent(id)}/edit?error=DuplicateVariants`
    );
  }

  // Only accept variant IDs that belong to this product.
  const existingVariantIds = new Set(
    existingProduct.variants.map((variant) => variant.id)
  );

  if (
    parsed.data.variants.some(
      (variant) => variant.id && !existingVariantIds.has(variant.id)
    )
  ) {
    redirect(
      `/admin/products/${encodeURIComponent(id)}/edit?error=InvalidInput`
    );
  }

  // Prevent duplicate image records when saving an unchanged URL.
  const currentImage = existingProduct.images[0];
  console.log(`[updateProduct] Updating product id=${id} with imageUrl:`, imageUrl ? imageUrl : "(none)");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name,
          description: description || null,
          category,
          price,
        },
      });

      if (imageUrl) {
        if (currentImage) {
          console.log(`[updateProduct] Updating existing ProductImage id=${currentImage.id}`);
          await tx.productImage.update({
            where: { id: currentImage.id },
            data: {
              imageUrl,
              alt: imageAlt || name,
              sortOrder: 0,
            },
          });
        } else {
          console.log(`[updateProduct] Creating new ProductImage for product id=${id}`);
          await tx.productImage.create({
            data: {
              productId: id,
              imageUrl,
              alt: imageAlt || name,
              sortOrder: 0,
            },
          });
        }
      } else if (currentImage) {
        console.log(`[updateProduct] Deleting ProductImage id=${currentImage.id}`);
        await tx.productImage.delete({
          where: { id: currentImage.id },
        });
      }

      const submittedIds = parsed.data.variants
        .map((variant) => variant.id)
        .filter((variantId): variantId is string => Boolean(variantId));

      // Remove variants omitted from the form.
      await tx.productVariant.deleteMany({
        where: {
          productId: id,
          ...(submittedIds.length > 0
            ? { id: { notIn: submittedIds } }
            : {}),
        },
      });

      // Update existing variants and create new ones.
      for (const variant of parsed.data.variants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
            },
          });
        }
      }
    });
  } catch (error) {
    console.error("Failed to update product:", error);

    redirect(
      `/admin/products/${encodeURIComponent(id)}/edit?error=SaveFailed`
    );
  }

  revalidatePath("/");
  revalidatePath(`/products/${existingProduct.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);

  redirect("/admin/products?success=updated");
}




export async function toggleProductStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const isActiveValue = String(formData.get("isActive") ?? "");

  if (!id || !["true", "false"].includes(isActiveValue)) {
    redirect("/admin/products?error=InvalidInput");
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!product) {
    redirect("/admin/products?error=NotFound");
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: isActiveValue === "true" },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect("/admin/products?success=statusUpdated");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!id || confirmation !== "DELETE") {
    redirect("/admin/products?error=InvalidInput");
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!product) {
    redirect("/admin/products?error=NotFound");
  }

  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect("/admin/products?success=deleted");
}
