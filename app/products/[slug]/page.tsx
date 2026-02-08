// app/(storefront)/p/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ChevronLeft,
  ShoppingBag,
  Tag,
  Boxes,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";

type ApiSuccess<T> = { success: true; message: string; data: T; meta?: any };

type Category = { _id: string; name?: string; title?: string; slug?: string; image?: string };
type Product = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  shortDetail?: string;
  price?: number;
  salePrice?: number;
  unit?: string;
  tags?: string[];
  thumbnail?: string;
  images?: string[];
  categoryId?: Category;
  variants?: any[];
};

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`${baseUrl()}/api/products/by-slug/${encodeURIComponent(slug)}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as ApiSuccess<Product>;
  return json?.data ?? null;
}

function formatMoney(n?: number) {
  if (typeof n !== "number") return null;
  return `৳ ${n.toLocaleString()}`;
}

function firstImage(p: Product) {
  return p.thumbnail || p.images?.[0] || "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) return { title: "Product" };

  return {
    title: product.title,
    description: product.shortDetail || product.description,
    openGraph: {
      title: product.title,
      description: product.shortDetail || product.description,
      images: firstImage(product) ? [firstImage(product)] : undefined,
    },
  };
}

export default async function ProductBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const categoryLabel = product.categoryId?.name || product.categoryId?.title;
  const sale = typeof product.salePrice === "number";
  const mainPrice = sale ? product.salePrice : product.price;

  const imgs = Array.from(
    new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))
  ) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-950/70 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:opacity-80"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to store
          </Link>

          <Link
            href="/products"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:opacity-80"
          >
            Browse products
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30">
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                {imgs[0] ? (
                  <img src={imgs[0]} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      No image
                    </div>
                  </div>
                )}
              </div>
            </div>

            {imgs.length > 1 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {imgs.slice(0, 12).map((src) => (
                  <div
                    key={src}
                    className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800"
                  >
                    <img src={src} alt="Thumbnail" className="h-16 w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {categoryLabel ? (
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200">
                  <Tag className="h-3.5 w-3.5" />
                  {categoryLabel}
                </span>
              ) : null}

              {product.unit ? (
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200">
                  <Boxes className="h-3.5 w-3.5" />
                  Unit: {product.unit}
                </span>
              ) : null}

              {sale ? (
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  On sale
                </span>
              ) : null}
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                {product.title}
              </h1>

              {product.shortDetail ? (
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {product.shortDetail}
                </p>
              ) : null}
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatMoney(mainPrice) ?? "—"}
                    {sale && typeof product.price === "number" ? (
                      <span className="ml-2 text-sm font-normal text-gray-500 line-through">
                        {formatMoney(product.price)}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* placeholder action */}
                <Link
                  href="/products"
                  className="rounded-2xl px-4 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition inline-flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Continue shopping
                </Link>
              </div>

              {product.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.slice(0, 10).map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Description</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {product.description || "No description provided."}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
