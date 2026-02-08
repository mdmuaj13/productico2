import { headers } from "next/headers";
import type { ApiSuccess, Category, Product } from "./types";

async function serverBaseUrl() {
  // In some Next versions, headers() is async -> Promise<ReadonlyHeaders>
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

export async function fetchCategories(): Promise<Category[]> {
  const base = await serverBaseUrl();
  const url = new URL("/api/categories", base);

  const res = await fetch(url.toString(), { next: { revalidate: 120 } });
  if (!res.ok) return [];

  const json = (await res.json()) as ApiSuccess<Category[]>;
  return json.data || [];
}

export async function fetchProducts(opts: {
  page: number;
  limit: number;
  search: string;
  categoryId?: string;
}): Promise<{ items: Product[]; meta?: any }> {
  const base = await serverBaseUrl();
  const url = new URL("/api/products", base);

  url.searchParams.set("page", String(opts.page));
  url.searchParams.set("limit", String(opts.limit));
  if (opts.search) url.searchParams.set("search", opts.search);
  if (opts.categoryId) url.searchParams.set("categoryId", opts.categoryId);

  const res = await fetch(url.toString(), { next: { revalidate: 30 } });
  if (!res.ok) return { items: [], meta: undefined };

  const json = (await res.json()) as ApiSuccess<Product[]>;
  return { items: json.data || [], meta: json.meta };
}
