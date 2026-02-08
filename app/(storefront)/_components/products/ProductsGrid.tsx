import Link from "next/link";
import { X } from "lucide-react";
import type { Product } from "./types";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";

export default function ProductsGrid({
  products,
  page,
  totalPages,
  limit,
  search,
  categoryId,
  hasActiveFilters,
}: {
  products: Product[];
  page: number;
  totalPages: number;
  limit: number;
  search: string;
  categoryId?: string;
  hasActiveFilters: boolean;
}) {
  return (
    <section className="lg:col-span-9">
      {products.length ? (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            limit={limit}
            search={search}
            categoryId={categoryId}
          />

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
  );
}
