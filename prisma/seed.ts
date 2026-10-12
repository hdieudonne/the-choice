
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const products = [
  {
    name: "Classic White Sneakers",
    slug: "classic-white-sneakers",
    description:
      "Versatile everyday sneakers designed for comfort and effortless style.",
    category: "Shoes",
    price: 25000,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",
    variants: [
      { size: "39", color: "White", stock: 4 },
      { size: "40", color: "White", stock: 5 },
      { size: "41", color: "White", stock: 3 },
      { size: "42", color: "White", stock: 2 },
    ],
  },
  {
    name: "Everyday Denim Jacket",
    slug: "everyday-denim-jacket",
    description:
      "A timeless denim jacket that works perfectly with casual outfits.",
    category: "Clothing",
    price: 32000,
    image:
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=85",
    variants: [
      { size: "S", color: "Blue", stock: 3 },
      { size: "M", color: "Blue", stock: 5 },
      { size: "L", color: "Blue", stock: 4 },
    ],
  },
  {
    name: "Minimal Leather Bag",
    slug: "minimal-leather-bag",
    description:
      "A versatile everyday bag with a clean, minimalist look.",
    category: "Accessories",
    price: 28000,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
    variants: [
      { size: "One size", color: "Brown", stock: 6 },
    ],
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        price: product.price,
        images: {
          create: {
            imageUrl: product.image,
            alt: product.name,
            sortOrder: 0,
          },
        },
        variants: {
          create: product.variants,
        },
      },
    });

    console.log(`Seeded: ${product.name}`);
  }

  console.log("SokoStyle sample products are ready!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
