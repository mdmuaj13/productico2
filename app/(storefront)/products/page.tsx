import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Tag,
  X,
} from "lucide-react";

type ApiSuccess<T> = { success: true; message: string; data: T; meta?: any };

type Category = {
  _id: string;
  title?: string;
  name?: string;
  slug?: string;
  image?: string;
};

type Product = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  thumbnail?: string;
  images?: string[];
  categoryId?: Category;
};

async function serverBaseUrl() {
  // In some Next versions, headers() is async -> Promise<ReadonlyHeaders>
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

async function fetchCategories(): Promise<Category[]> {
  const base = await serverBaseUrl();
  const url = new URL("/api/categories", base);

  const res = await fetch(url.toString(), { next: { revalidate: 120 } });
  if (!res.ok) return [];

  const json = (await res.json()) as ApiSuccess<Category[]>;
  return json.data || [];
}

async function fetchProducts(opts: {
  page: number;
  limit: number;
  search: string;
  categoryId?: string;
}): Promise<{ items: Product[]; meta?: any }> {
  const base = await serverBaseUrl();
  const url = new URL("/api/products", base);

  url.searchParams.set("page", String(opts.page));
  url.searchParams.set("limit", String(opts.limit));
  if (opts.search) url.searchParams.set("search", opts.search);
  if (opts.categoryId) url.searchParams.set("categoryId", opts.categoryId);

  const res = await fetch(url.toString(), { next: { revalidate: 30 } });
  if (!res.ok) return { items: [], meta: undefined };

  const json = (await res.json()) as ApiSuccess<Product[]>;
  return { items: json.data || [], meta: json.meta };
}

function categoryLabel(c: Category) {
  return c.title || c.name || "Category";
}

function buildUrl(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `/products?${qs}` : "/products";
}

function ProductCard({ p }: { p: Product }) {
  const img = p.thumbnail || p.images?.[0] || p.categoryId?.image || "";
  const price = p.salePrice ?? p.price;
  const cat = p.categoryId ? p.categoryId.title || p.categoryId.name : "";

  return (
    <Link
      href={p.slug ? `/p/${encodeURIComponent(p.slug)}` : "#"}
      className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={p.title}
            className="h-full w-full object-cover group-hover:scale-[1.03] transition"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-sm text-gray-500">
            No image
          </div>
        )}
      </div>

      <div className="p-4 space-y-1">
        {cat ? <div className="text-xs text-gray-500">{cat}</div> : null}

        <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">
          {p.title}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {p.description || " "}
        </div>

        {typeof price === "number" ? (
          <div className="pt-2 font-semibold text-gray-900 dark:text-white">
            ৳ {price.toLocaleString()}
            {p.salePrice && p.price ? (
              <span className="ml-2 text-sm font-normal text-gray-500 line-through">
                ৳ {p.price.toLocaleString()}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page || 1));
  const limit = Math.min(24, Math.max(8, Number(searchParams.limit || 12)));
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const categoryId =
    typeof searchParams.categoryId === "string"
      ? searchParams.categoryId
      : undefined;

  const hasActiveFilters = Boolean(search || categoryId);

  const [categories, productRes] = await Promise.all([
    fetchCategories(),
    fetchProducts({ page, limit, search, categoryId }),
  ]);

  const products = productRes.items;
  const meta = productRes.meta as
    | { total?: number; page?: number; limit?: number; totalPages?: number }
    | undefined;

  const totalPages = meta?.totalPages ?? 1;
  const hasSidebar = categories.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Title + search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              All products
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {meta?.total ? `${meta.total} items` : "Browse everything we have"}
            </p>
          </div>

          {/* Search */}
          <form
            action="/products"
            className="w-full md:w-[520px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-2 flex items-center gap-2"
          >
            <Search className="h-4 w-4 text-gray-500" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search products…"
              className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
            />

            {/* keep category filter when searching */}
            {categoryId ? (
              <input type="hidden" name="categoryId" value={categoryId} />
            ) : null}

            {hasActiveFilters ? (
              <Link
                href="/products"
                className="rounded-xl px-3 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-900/40 transition inline-flex items-center gap-2"
                aria-label="Clear search and filters"
              >
                <X className="h-4 w-4" />
                Clear
              </Link>
            ) : null}

            <button
              type="submit"
              className="rounded-xl px-3 py-2 text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition"
            >
              Search
            </button>
          </form>
        </div>

        <div className={`mt-7 grid gap-6 ${hasSidebar ? "lg:grid-cols-12" : ""}`}>
          {/* Sidebar */}
          {hasSidebar ? (
            <aside className="lg:col-span-3">
              <div className="sticky top-[76px] space-y-3">
                {/* Filters header + clear */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </div>

                  {hasActiveFilters ? (
                    <Link
                      href="/products"
                      className="text-xs font-semibold text-gray-700 dark:text-gray-200 hover:opacity-80 inline-flex items-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </Link>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-3">
                    Categories
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={buildUrl({ page: 1, limit, search })}
                      className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition ${
                        !categoryId
                          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                          : "hover:bg-white dark:hover:bg-gray-900/40 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <span>All</span>
                      <span className="text-xs opacity-80">{categories.length}</span>
                    </Link>

                    {categories.map((c) => {
                      const active = categoryId === c._id;
                      return (
                        <Link
                          key={c._id}
                          href={buildUrl({ page: 1, limit, search, categoryId: c._id })}
                          className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition ${
                            active
                              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                              : "hover:bg-white dark:hover:bg-gray-900/40 text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Tag className="h-4 w-4 opacity-70" />
                            {categoryLabel(c)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          ) : null}

          {/* Products grid */}
          <section className={hasSidebar ? "lg:col-span-9" : ""}>
            {products.length ? (
              <>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p._id} p={p} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-between">
                  <Link
                    aria-disabled={page <= 1}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold border transition ${
                      page <= 1
                        ? "pointer-events-none opacity-50 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                        : "border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900/40 text-gray-700 dark:text-gray-200"
                    }`}
                    href={buildUrl({ page: Math.max(1, page - 1), limit, search, categoryId })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Link>

                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page <span className="font-semibold">{page}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </div>

                  <Link
                    aria-disabled={page >= totalPages}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold border transition ${
                      page >= totalPages
                        ? "pointer-events-none opacity-50 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                        : "border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900/40 text-gray-700 dark:text-gray-200"
                    }`}
                    href={buildUrl({ page: Math.min(totalPages, page + 1), limit, search, categoryId })}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Bottom clear (only when active) */}
                {hasActiveFilters ? (
                  <div className="mt-6 flex justify-center">
                    <Link
                      href="/products"
                      className="rounded-2xl px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-900/40 transition inline-flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear filters
                    </Link>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-8 text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  No products found
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Try searching with a different keyword or clear filters.
                </div>

                <div className="mt-5 flex justify-center">
                  <Link
                    href="/products"
                    className="rounded-2xl px-4 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition"
                  >
                    Clear filters
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
