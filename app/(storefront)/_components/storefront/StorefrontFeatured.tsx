import Link from "next/link";
import type { Product } from "./types";
import ProductCard from "./ProductCard";

export default function StorefrontFeatured({
  shopName,
  products,
}: {
  shopName: string;
  products: Product[];
}) {
  if (!products.length) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Featured products
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Curated picks from {shopName}
          </p>
        </div>

        <Link
          href="/products"
          className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:opacity-80"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-6 mt-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p._id} p={p} />
        ))}
      </div>
    </section>
  );
}
