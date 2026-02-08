"use client";

import { Loader2 } from "lucide-react";

function formatMoney(n: number) {
  return `৳ ${n.toLocaleString()}`;
}

export function MobileStickyBar({
  total,
  canPlace,
  loading,
  onPlace,
}: {
  total: number;
  canPlace: boolean;
  loading: boolean;
  onPlace: () => void;
}) {
  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/70 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/50 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-base font-extrabold text-gray-900 dark:text-white">
              {formatMoney(total)}
            </div>
          </div>

          <button
            onClick={onPlace}
            disabled={!canPlace}
            className={`shrink-0 rounded-2xl px-5 py-3 font-semibold text-sm transition inline-flex items-center justify-center gap-2 ${
              !canPlace
                ? "opacity-50 pointer-events-none bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                : "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
            }`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Place order
          </button>
        </div>
      </div>

      {/* spacer */}
      <div className="lg:hidden h-20" />
    </>
  );
}
