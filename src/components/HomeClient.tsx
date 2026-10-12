"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Menu,
  MessageCircle,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";

const WHATSAPP_NUMBER = "250780330338"; // The Choice Style WhatsApp number

const categories = ["All", "Clothing", "Shoes", "Accessories"];

function formatPrice(price: number) {
  return `RWF ${price.toLocaleString("en-US")}`;
}

function getWhatsAppLink(product: Product) {
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];

  const message = [
    "Hello The Choice Style!",
    `I am interested in: ${product.name}.`,
    `Price: ${formatPrice(product.price)}.`,
    `Available sizes: ${sizes.join(", ") || "Please confirm"}.`,
    `Colors: ${colors.join(", ") || "Please confirm"}.`,
    `Product: ${product.slug}`,
    "Please confirm availability.",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function Home({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <main className="min-h-screen bg-[#faf9f6] dark:bg-[#111210] text-[#22251f] dark:text-[#e8e8e2]">
      {/* Announcement bar */}
      <div className="bg-[#263b2d] dark:bg-[#1e2e22] px-4 py-2.5 text-center text-xs tracking-[0.15em] text-white">
        YOUR STYLE, YOUR STORY — WELCOME TO THE CHOICE STYLE
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-black/5 dark:border-white/5 bg-[#faf9f6]/95 dark:bg-[#111210]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <a href="#" className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="The Choice Style logo"
              className="h-8 w-8 rounded-lg object-contain shadow-xs"
            />
            <span className="text-2xl font-black tracking-[-0.07em]">
              THE CHOICE<span className="text-[#788568] dark:text-[#8da47a]">.</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#home" className="transition hover:text-[#788568] dark:hover:text-[#8da47a]">Home</a>
            <a href="#collection" className="transition hover:text-[#788568] dark:hover:text-[#8da47a]">Shop all</a>
            <a href="#about" className="transition hover:text-[#788568] dark:hover:text-[#8da47a]">About us</a>
            <a href="#contact" className="transition hover:text-[#788568] dark:hover:text-[#8da47a]">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="rounded-full border border-black/10 dark:border-white/10 p-2.5 transition hover:bg-[#e9e9e0] dark:hover:bg-white/10"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <a
              href="#collection"
              aria-label="Browse products"
              className="rounded-full border border-black/10 dark:border-white/10 p-2.5 transition hover:bg-[#e9e9e0] dark:hover:bg-white/10"
            >
              <ShoppingBag size={19} strokeWidth={1.7} />
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="rounded-full border border-black/10 dark:border-white/10 p-2.5 md:hidden"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-4 border-t border-black/5 dark:border-white/5 px-6 py-5 text-sm md:hidden bg-[#faf9f6] dark:bg-[#111210]">
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#collection" onClick={() => setMenuOpen(false)}>Shop all</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About us</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
        )}
      </header>

      {/* Hero section */}
      <section id="home" className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="grid overflow-hidden rounded-[1.5rem] bg-[#e9e9df] dark:bg-[#1e211c] md:min-h-[510px] md:grid-cols-2">
          <div className="flex flex-col items-start justify-center px-7 py-12 md:px-14 md:py-16 lg:px-20">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#64735d] dark:text-[#8da47a]">
              Fashion made for you
            </p>

            <h1 className="max-w-lg text-5xl font-medium leading-[1.08] tracking-[-0.055em] md:text-6xl lg:text-7xl">
              Find your
              <br />
              everyday
              <br />
              <span className="font-serif italic text-[#788568] dark:text-[#8da47a]">
                favourite.
              </span>
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-7 text-[#5d6157] dark:text-[#9a9c93] md:text-base">
              Discover clothing and footwear that bring comfort, confidence, and
              personality to every outfit.
            </p>

            <a
              href="#collection"
              className="mt-8 inline-flex items-center gap-4 rounded-full bg-[#263b2d] dark:bg-[#3a5543] px-7 py-4 text-sm text-white transition hover:bg-[#3b5541] dark:hover:bg-[#4a6852]"
            >
              Explore collection
              <ArrowDown size={17} />
            </a>

            <p className="mt-8 text-xs tracking-wide text-[#62675d] dark:text-[#6b6d65]">
              SHOP ONLINE · CONTACT US ON WHATSAPP
            </p>
          </div>

          <div className="relative min-h-[320px] md:min-h-[510px]">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90"
              alt="Fashion inspiration and everyday outfits"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute bottom-5 right-5 rounded-full bg-[#faf9f6]/95 dark:bg-[#111210]/90 px-5 py-3 text-xs tracking-wide">
              EVERYDAY STYLE, REIMAGINED
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-7 text-center sm:grid-cols-3 md:px-8">
        <div className="border-b border-black/10 dark:border-white/10 pb-5 sm:border-b-0 sm:border-r sm:pb-0">
          <p className="text-sm font-semibold">Curated for your style</p>
          <p className="mt-2 text-xs text-[#77786f] dark:text-[#9a9c93]">Clothing and shoes for every day</p>
        </div>
        <div className="border-b border-black/10 dark:border-white/10 pb-5 sm:border-b-0 sm:border-r sm:pb-0">
          <p className="text-sm font-semibold">Easy WhatsApp enquiries</p>
          <p className="mt-2 text-xs text-[#77786f] dark:text-[#9a9c93]">Ask about sizes, colors, and stock</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Delivery or store pickup</p>
          <p className="mt-2 text-xs text-[#77786f] dark:text-[#9a9c93]">Contact us to arrange collection</p>
        </div>
      </section>

      {/* Product collection */}
      <section id="collection" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#788568] dark:text-[#8da47a]">
              Made to be worn
            </p>
            <h2 className="text-3xl font-medium tracking-[-0.04em] md:text-5xl">
              The collection
            </h2>
            <p className="mt-3 text-sm text-[#77786f] dark:text-[#9a9c93]">
              Find something that feels like you.
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#1c1e1b] px-4 py-3 md:w-72">
            <Search size={17} className="text-[#77786f] dark:text-[#9a9c93]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#999a91] dark:placeholder:text-[#6b6d65]"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-5 py-2.5 text-sm transition ${
                activeCategory === category
                  ? "bg-[#263b2d] dark:bg-[#3a5543] text-white"
                  : "border border-black/10 dark:border-white/10 bg-transparent hover:bg-[#e9e9df] dark:hover:bg-white/5"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <article key={product.id} className="group min-w-0">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#eeede7] dark:bg-[#1e211c]">
                <Link href={`/products/${product.slug}`} className="block h-full">
                  <img
                    src={
                      product.images[0]?.imageUrl ??
                      "/images/product-placeholder.png"
                    }
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>

                <a
                  href={getWhatsAppLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-2 rounded-full bg-[#263b2d] dark:bg-[#3a5543] px-2 py-3 text-[11px] font-medium text-white transition hover:bg-[#3b5541] dark:hover:bg-[#4a6852] sm:inset-x-3 sm:bottom-3 sm:text-xs"
                >
                  <MessageCircle size={15} />
                  Ask on WhatsApp
                </a>
              </div>

              <div className="pt-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#888a7f] dark:text-[#6b6d65]">
                  {product.category} ·{" "}
                  {[...new Set(product.variants.map((v) => v.color))].join(", ")}
                </p>
                <h3 className="mt-2 text-sm font-medium leading-5 sm:text-base">
                  <Link
                    href={`/products/${product.slug}`}
                    className="transition hover:text-[#788568] dark:hover:text-[#8da47a]"
                  >
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-2 text-sm font-semibold">{formatPrice(product.price)}</p>
                <p className="mt-2 text-xs text-[#77786f] dark:text-[#9a9c93]">
                  Sizes: {[...new Set(product.variants.map((v) => v.size))].join(", ")}
                </p>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg font-medium">No products found</p>
            <p className="mt-2 text-sm text-[#77786f] dark:text-[#9a9c93]">
              Try another search or category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("All");
              }}
              className="mt-4 text-sm underline underline-offset-4"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* About section */}
      <section id="about" className="bg-[#e9e9df] dark:bg-[#1a1c19]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2 md:items-center md:px-8 md:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#788568] dark:text-[#8da47a]">
              A little about us
            </p>
            <h2 className="mt-4 max-w-lg text-3xl font-medium leading-tight tracking-[-0.04em] md:text-5xl">
              Good style should feel effortless.
            </h2>
          </div>
          <div>
            <p className="text-sm leading-7 text-[#5d6157] dark:text-[#9a9c93] md:text-base">
              The Choice Style brings together everyday fashion, footwear, and
              accessories in one convenient place. Browse our collection, find
              your favorite pieces, and message us directly to check
              availability or arrange delivery and pickup.
            </p>
            <a
              href="#collection"
              className="mt-6 inline-flex items-center gap-2 border-b border-[#263b2d] dark:border-[#8da47a] pb-2 text-sm font-medium"
            >
              Discover the collection
              <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#263b2d] dark:bg-[#0f1710] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <a href="#" className="flex items-center gap-2.5">
                <img
                  src="/logo.svg"
                  alt="The Choice Style logo"
                  className="h-8 w-8 rounded-lg object-contain shadow-xs brightness-110"
                />
                <span className="text-2xl font-black tracking-[-0.07em]">
                  THE CHOICE<span className="text-[#bdc6ae]">.</span>
                </span>
              </a>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
                Everyday fashion, carefully chosen for your style.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Explore</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
                <a href="#home" className="hover:text-white">Home</a>
                <a href="#collection" className="hover:text-white">Shop collection</a>
                <a href="#about" className="hover:text-white">About The Choice Style</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Have a question?</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Contact us to check availability, ask about sizing, or arrange
                delivery and pickup.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello The Choice Style! I would like to make an enquiry.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-[#263b2d] transition hover:bg-[#e9e9df]"
              >
                <MessageCircle size={17} />
                Chat with us
              </a>
            </div>
          </div>

          <div className="mt-12 border-t border-white/15 pt-6 text-xs text-white/50">
            © {new Date().getFullYear()} The Choice Style. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
