"use client";

import { CreditCard, Wallet } from "lucide-react";

export type PaymentType = "cash" | "bkash" | "nagad" | "card";

export function PaymentMethodCard({
  paymentType,
  setPaymentType,
}: {
  paymentType: PaymentType;
  setPaymentType: (v: PaymentType) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/30 shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          Payment method
        </div>
        <div className="text-[11px] text-gray-500">COD only</div>
      </div>

      <div className="mt-3 grid gap-2">
        <button
          type="button"
          onClick={() => setPaymentType("cash")}
          className={`w-full rounded-xl border px-3 py-2 text-left transition ${
            paymentType === "cash"
              ? "border-gray-900 dark:border-white bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-950/20 hover:bg-gray-50 dark:hover:bg-gray-950/30"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                paymentType === "cash"
                  ? "bg-white/15 dark:bg-gray-900/15"
                  : "bg-gray-100 dark:bg-gray-900/50"
              }`}
            >
              <Wallet className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <div className="text-sm font-semibold leading-5">
                Cash on delivery
              </div>
              <div
                className={`text-[11px] leading-4 ${
                  paymentType === "cash"
                    ? "text-white/80 dark:text-gray-700"
                    : "text-gray-500"
                }`}
              >
                Pay when you receive.
              </div>
            </div>
          </div>
        </button>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/20 px-3 py-1 text-[11px] text-gray-600 dark:text-gray-300 opacity-70">
            <Wallet className="h-3.5 w-3.5" />
            bKash <span className="text-gray-500">(soon)</span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/20 px-3 py-1 text-[11px] text-gray-600 dark:text-gray-300 opacity-70">
            <Wallet className="h-3.5 w-3.5" />
            Nagad <span className="text-gray-500">(soon)</span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/20 px-3 py-1 text-[11px] text-gray-600 dark:text-gray-300 opacity-70">
            <CreditCard className="h-3.5 w-3.5" />
            Card <span className="text-gray-500">(soon)</span>
          </span>
        </div>

        <p className="text-[11px] text-gray-500">
          Only Cash on Delivery is available right now.
        </p>
      </div>
    </div>
  );
}
