"use client";

import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export function CheckoutHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-950/50 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="py-2.5 flex items-center justify-between gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-gray-900/40 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Center: subtle progress hint */}
          <div className="hidden sm:flex items-center gap-2 text-[12px] text-gray-500">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Checkout
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span>Delivery</span>
            <span className="text-gray-300 dark:text-gray-700">→</span>
            <span>Confirm</span>
          </div>

          <div className="inline-flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </div>
        </div>
      </div>
    </header>
  );
}
