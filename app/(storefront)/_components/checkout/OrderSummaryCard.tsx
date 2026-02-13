"use client";

import Link from "next/link";
import { CartItem } from "@/lib/cart";

function formatMoney(n: number) {
  return `৳ ${n.toLocaleString()}`;
}

export function OrderSummaryCard({
  items,
  subtotal,
  discount = 0,
  total,
  compact,
}: {
  items: CartItem[];
  subtotal: number;
  discount?: number; // ✅ new
  total?: number;    // ✅ new (final payable)
  compact?: boolean;
}) {
  const payableTotal =
    typeof total === "number" ? total : Math.max(0, subtotal - discount);

  return (
    <div
      className={`rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/30 shadow-sm ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        Order summary
      </div>

      {items.length ? (
        <div className="mt-4 space-y-3">
          {items.map((it) => (
            <div
              key={it.productId}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {it.title}
                </div>
                <div className="text-xs text-gray-500">
                  {it.qty} × {formatMoney(it.price)}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatMoney(it.price * it.qty)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Your cart is empty.{" "}
          <Link className="underline" href="/products">
            Go shopping
          </Link>
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800 space-y-2 text-sm">
        <div className="flex items-center justify-between text-gray-700 dark:text-gray-200">
          <span>Subtotal</span>
          <span className="font-semibold">{formatMoney(subtotal)}</span>
        </div>

        {/* ✅ show discount only when applied */}
        {discount > 0 ? (
          <div className="flex items-center justify-between text-gray-700 dark:text-gray-200">
            <span>Discount</span>
            <span className="font-semibold">- {formatMoney(discount)}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-gray-500">
          <span>Delivery</span>
          <span>Cash on delivery</span>
        </div>

        <div className="pt-3 flex items-center justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">
            Total
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatMoney(payableTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
