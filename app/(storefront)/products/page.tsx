import type { Metadata } from "next";
import { fetchCategories, fetchProducts } from "../_components/products/api";
import ProductsSidebar from "../_components/products/ProductsSidebar";
import ProductsGrid from "../_components/products/ProductsGrid";
import ProductsHeader from "../_components/products/ProductsHeader";
import { ProductsMeta } from "../_components/products/types";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page || 1));
  const limit = Math.min(24, Math.max(8, Number(searchParams.limit || 12)));
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const categoryId =
    typeof searchParams.categoryId === "string" ? searchParams.categoryId : undefined;

  const hasActiveFilters = Boolean(search || categoryId);

  const [categories, productRes] = await Promise.all([
    fetchCategories(),
    fetchProducts({ page, limit, search, categoryId }),
  ]);

  const products = productRes.items;

  const meta = productRes.meta as ProductsMeta | undefined;
  const totalPages = meta?.totalPages ?? 1;

  const hasSidebar = categories.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <main className="container mx-auto px-4 py-8">
        <ProductsHeader
          title="All products"
          totalText={meta?.total ? `${meta.total} items` : "Browse everything we have"}
          search={search}
          categoryId={categoryId}
          hasActiveFilters={hasActiveFilters}
        />

        <div className={`mt-7 grid gap-6 ${hasSidebar ? "lg:grid-cols-12" : ""}`}>
          {hasSidebar ? (
            <ProductsSidebar
              categories={categories}
              page={page}
              limit={limit}
              search={search}
              categoryId={categoryId}
              hasActiveFilters={hasActiveFilters}
            />
          ) : null}

          {/* If no sidebar, grid should span full width */}
          <div className={hasSidebar ? "lg:col-span-9" : ""}>
            <ProductsGrid
              products={products}
              page={page}
              totalPages={totalPages}
              limit={limit}
              search={search}
              categoryId={categoryId}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
