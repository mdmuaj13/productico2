import type { Category } from "./types";

export function categoryLabel(c: Category) {
  return c.title || c.name || "Category";
}

export function buildUrl(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `/products?${qs}` : "/products";
}
