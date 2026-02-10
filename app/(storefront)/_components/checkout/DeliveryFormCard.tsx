"use client";

import { Info, Truck } from "lucide-react";

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export function DeliveryFormCard({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/30 shadow-sm p-6">
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
        <Truck className="h-4 w-4 text-gray-500" />
        Delivery details
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        We’ll use this info to deliver your order.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Full name <span className="text-red-500">*</span>
          </div>
          <input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
            placeholder="Your name"
            autoComplete="name"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Phone <span className="text-red-500">*</span>
          </div>
          <input
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
            placeholder="01XXXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>

        <label className="space-y-1 sm:col-span-2">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Email (optional)
          </div>
          <input
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
            placeholder="you@email.com"
            type="email"
            autoComplete="email"
          />
        </label>

        <label className="space-y-1 sm:col-span-2">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Full address <span className="text-red-500">*</span>
          </div>
          <textarea
            value={form.address}
            onChange={(e) =>
              setForm((s) => ({ ...s, address: e.target.value }))
            }
            className="w-full min-h-[120px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
            placeholder="House, Road, Area, City"
            autoComplete="street-address"
          />
        </label>

        <label className="space-y-1 sm:col-span-2">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Notes (optional)
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
            className="w-full min-h-[90px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
            placeholder="Delivery instructions, preferred time, etc."
          />
        </label>

        <div className="sm:col-span-2 mt-1 flex items-start gap-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/20 p-3">
          <Info className="h-4 w-4 mt-0.5 text-gray-500" />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Make sure your phone number is correct. We may call to confirm
            delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
