import Link from "next/link";
import type { Product } from "./types";

export default function ProductCard({ p }: { p: Product }) {
  const img = p.thumbnail || p.images?.[0] || p.categoryId?.image || "";
  const price = p.salePrice ?? p.price;
  const cat = p.categoryId ? p.categoryId.title || p.categoryId.name : "";

  return (
    <Link
      href={p.slug ? `/p/${encodeURIComponent(p.slug)}` : "#"}
      className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={p.title}
            className="h-full w-full object-cover group-hover:scale-[1.03] transition"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-sm text-gray-500">
            No image
          </div>
        )}
      </div>

      <div className="p-4 space-y-1">
        {cat ? <div className="text-xs text-gray-500">{cat}</div> : null}

        <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">
          {p.title}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {p.description || " "}
        </div>

        {typeof price === "number" ? (
          <div className="pt-2 font-semibold text-gray-900 dark:text-white">
            ৳ {price.toLocaleString()}
            {p.salePrice && p.price ? (
              <span className="ml-2 text-sm font-normal text-gray-500 line-through">
                ৳ {p.price.toLocaleString()}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
