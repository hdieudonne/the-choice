
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);

    return NextResponse.json(
      { error: "Unable to load products." },
      { status: 500 }
    );
  }
}
