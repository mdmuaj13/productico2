import Link from "next/link"
import { ShoppingBag, LayoutDashboard } from "lucide-react"
import CartBadge from "./storefront-cart-badge"
import type { StorefrontInfo } from "../layout"

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium
                 text-gray-700 dark:text-gray-200
                 hover:bg-gray-100 dark:hover:bg-gray-900/50
                 transition"
    >
      {children}
    </Link>
  )
}

export default function StorefrontHeader({ info }: { info: StorefrontInfo | null }) {
  const shopName = info?.shopName || "Your Store"
  const tagline = info?.tagline || "Everything you need, in one place"
  const logo = info?.logo || ""

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-950/70 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div
            className="h-12 w-12 rounded-2xl border border-gray-200 dark:border-gray-800
                       bg-white dark:bg-gray-950
                       shadow-sm flex items-center justify-center overflow-hidden
                       ring-1 ring-black/5 dark:ring-white/5"
            aria-label="Store logo"
          >
            {logo ? (
              <img
                src={logo}
                alt={shopName}
                className="h-full w-full object-contain px-1"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200" />
            )}
          </div>

          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-2 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white truncate text-base sm:text-lg">
                {shopName}
              </div>

              {/* Optional small badge/pill for credibility */}
              <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                Store
              </span>
            </div>

            {/* <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate hidden sm:block">
              {tagline}
            </div> */}
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
          <NavLink href="/products">Products</NavLink>

          <NavLink href="/cart">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <CartBadge />
          </NavLink>

          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold
                       bg-gray-900 text-white hover:bg-gray-800
                       dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200
                       transition"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}