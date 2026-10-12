
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";



const WHATSAPP_NUMBER = "2507XXXXXXXX";

function formatPrice(price: number) {
  return `RWF ${price.toLocaleString("en-US")}`;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        orderBy: [{ size: "asc" }, { color: "asc" }],
      },
    },
  });

  if (!product) {
    notFound();
  }

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];

  const totalStock = product.variants.reduce(
    (total, variant) => total + variant.stock,
    0
  );

  const message = [
    "Hello SokoStyle!",
    `I am interested in: ${product.name}.`,
    `Price: ${formatPrice(product.price)}.`,
    `Product link: ${product.slug}`,
    "Please confirm available sizes, colors, and stock.",
  ].join("\n");

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#22251f]">
      <header className="border-b border-black/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="text-2xl font-black tracking-[-0.07em]">
            SOKO<span className="text-[#788568]">STYLE.</span>
          </Link>

          <Link
            href="/#collection"
            className="text-sm transition hover:text-[#788568]"
          >
            Shop collection
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <Link
          href="/#collection"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#77786f] hover:text-[#263b2d]"
        >
          <ArrowLeft size={16} />
          Back to collection
        </Link>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {product.images.length > 0 ? (
              product.images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-[4/5] overflow-hidden rounded-xl bg-[#eeede7]"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.alt ?? product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-xl bg-[#eeede7] text-sm text-[#77786f] sm:col-span-2">
                Product photo coming soon
              </div>
            )}
          </div>

          <div className="py-2 md:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#788568]">
              {product.category}
            </p>

            <h1 className="mt-4 text-3xl font-medium tracking-[-0.04em] md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-xl font-semibold">
              {formatPrice(product.price)}
            </p>

            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[#696b62]">
              {product.description ?? "Contact us to learn more about this product."}
            </p>

            <div className="mt-8 border-t border-black/10 pt-6">
              <h2 className="text-sm font-semibold">Available sizes</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.length > 0 ? (
                  sizes.map((size) => {
                    const available = product.variants.some(
                      (variant) =>
                        variant.size === size && variant.stock > 0
                    );

                    return (
                      <span
                        key={size}
                        className={`rounded-full border px-4 py-2 text-sm ${
                          available
                            ? "border-black/10"
                            : "border-black/5 text-[#999a91] line-through"
                        }`}
                      >
                        {size}
                      </span>
                    );
                  })
                ) : (
                  <p className="text-sm text-[#77786f]">
                    Contact us for sizing information.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold">Available colors</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.length > 0 ? (
                  colors.map((color) => (
                    <span
                      key={color}
                      className="rounded-full border border-black/10 px-4 py-2 text-sm"
                    >
                      {color}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-[#77786f]">
                    Contact us for color options.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-[#e9e9df] p-4">
              <p className="text-sm font-medium">
                {totalStock > 0 ? "Available to enquire about" : "Stock unavailable"}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#696b62]">
                {totalStock > 0
                  ? "Message us to confirm your preferred size and color before visiting or arranging delivery."
                  : "Please contact the shop to ask about restocking."}
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#263b2d] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#3b5541]"
            >
              <MessageCircle size={19} />
              Ask about this product on WhatsApp
            </a>

            <p className="mt-4 text-center text-xs leading-5 text-[#77786f]">
              Delivery and store pickup can be arranged directly with the shop.
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-12 border-t border-black/10 px-5 py-8 text-center text-xs text-[#77786f]">
        © {new Date().getFullYear()} SokoStyle. All rights reserved.
      </footer>
    </main>
  );
}
