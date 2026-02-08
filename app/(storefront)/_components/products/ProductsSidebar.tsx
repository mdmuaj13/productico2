import Link from "next/link";
import { SlidersHorizontal, Tag, X } from "lucide-react";
import type { Category } from "./types";
import { buildUrl, categoryLabel } from "./helpers";

export default function ProductsSidebar({
  categories,
  page,
  limit,
  search,
  categoryId,
  hasActiveFilters,
}: {
  categories: Category[];
  page: number;
  limit: number;
  search: string;
  categoryId?: string;
  hasActiveFilters: boolean;
}) {
  if (!categories.length) return null;

  return (
    <aside className="lg:col-span-3">
      <div className="sticky top-[76px] space-y-3">
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
          <div className="text-xs font-semibold text-gray-500 mb-3">Categories</div>

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
  );
}
