import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-14 max-w-xl text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20">
          <BadgeCheck className="h-7 w-7 text-emerald-700 dark:text-emerald-300" />
        </div>

        <h1 className="mt-5 text-3xl font-bold text-gray-900 dark:text-white">
          Order placed!
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Thanks! We received your order and will contact you soon.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/products"
            className="rounded-2xl px-5 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="rounded-2xl px-5 py-3 border border-gray-200 dark:border-gray-800 font-semibold text-sm hover:bg-white dark:hover:bg-gray-900/40 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
