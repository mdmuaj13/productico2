import Link from "next/link";
import { Search, X } from "lucide-react";

export default function ProductsHeader({
  title,
  totalText,
  search,
  categoryId,
  hasActiveFilters,
}: {
  title: string;
  totalText: string;
  search: string;
  categoryId?: string;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {totalText}
        </p>
      </div>

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

        {categoryId ? <input type="hidden" name="categoryId" value={categoryId} /> : null}

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
  );
}
