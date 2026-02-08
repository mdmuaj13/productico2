// app/(storefront)/_components/storefront-header.tsx
import Link from "next/link";
import { ShoppingBag, LayoutDashboard } from "lucide-react";
import CartBadge from "./storefront-cart-badge";
import type { StorefrontInfo } from "../layout";

export default function StorefrontHeader({ info }: { info: StorefrontInfo | null }) {
  const shopName = info?.shopName || "Your Store";
  const tagline = info?.tagline || "Everything you need, in one place";
  const logo = info?.logo || "";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-950/70 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          {logo ? (
            <img
              src={logo}
              alt={shopName}
              className="h-9 w-9 rounded-xl object-cover border border-gray-200 dark:border-gray-800 bg-white"
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-gray-900 dark:bg-white" />
          )}

          <div className="min-w-0 leading-tight">
            <div className="font-bold text-gray-900 dark:text-white truncate">
              {shopName}
            </div>
            <div className="text-xs text-gray-500 hidden sm:block truncate">
              {tagline}
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/products"
            className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition"
          >
            Products
          </Link>

          <Link
            href="/cart"
            className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition inline-flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
            <CartBadge />
          </Link>

          <Link
            href="/app/dashboard"
            className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition inline-flex items-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
