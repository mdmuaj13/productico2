import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildUrl } from "./helpers";

export default function Pagination({
  page,
  totalPages,
  limit,
  search,
  categoryId,
}: {
  page: number;
  totalPages: number;
  limit: number;
  search: string;
  categoryId?: string;
}) {
  return (
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
  );
}
