import type { ApiSuccess, StorefrontDoc, StorefrontMap, Product } from "./types";

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function fetchStorefrontAll(): Promise<StorefrontMap> {
  const res = await fetch(`${baseUrl()}/api/storefront?type=all`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return {};
  const json = (await res.json()) as ApiSuccess<Record<string, StorefrontDoc>>;
  return (json.data || {}) as StorefrontMap;
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids?.length) return [];
  const sp = new URLSearchParams();
  sp.set("ids", ids.join(","));
  const res = await fetch(`${baseUrl()}/api/products/by-ids?${sp.toString()}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as ApiSuccess<Product[]>;
  return json.data || [];
}
