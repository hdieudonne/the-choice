import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const instant = false;



export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <HomeClient products={products} />;
}
