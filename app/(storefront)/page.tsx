import type { Metadata } from "next";
import StorefrontHero from "./_components/storefront/StorefrontHero";
import StorefrontFeatured from "./_components/storefront/StorefrontFeatured";
import StorefrontPolicyPreview from "./_components/storefront/StorefrontPolicyPreview";
import type { StorefrontMap } from "./_components/storefront/types";
import { fetchProductsByIds, fetchStorefrontAll } from "./_components/storefront/api";

export async function generateMetadata(): Promise<Metadata> {
  const sf = await fetchStorefrontAll();
  const info = sf.info?.type === "info" ? sf.info.value : undefined;

  return {
    title: info?.metaTitle || info?.shopName || "Store",
    description: info?.metaDescription || info?.tagline,
    openGraph: {
      title: info?.metaTitle || info?.shopName,
      description: info?.metaDescription || info?.tagline,
      images: info?.metaImage ? [info.metaImage] : undefined,
    },
  };
}

export default async function StorefrontHomePage() {
  const sf: StorefrontMap = await fetchStorefrontAll();

  const info = sf.info?.type === "info" ? sf.info.value : undefined;
  const contact = sf.contact?.type === "contact" ? sf.contact.value : undefined;
  const featured = sf.featured?.type === "featured" ? sf.featured.value : undefined;

  const terms = sf.terms?.type === "terms" ? sf.terms.value : undefined;
  const privacy = sf.privacy?.type === "privacy" ? sf.privacy.value : undefined;
  const refund = sf.refund?.type === "refund" ? sf.refund.value : undefined;

  const shopName = info?.shopName || "Your Store";
  const tagline = info?.tagline || "Everything you need, in one place";
  const heroImage = info?.heroImage || "";

  const featuredProducts = await fetchProductsByIds(featured?.productIds || []);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <StorefrontHero
        shopName={shopName}
        tagline={tagline}
        heroImage={heroImage}
        contact={contact}
      />

      <StorefrontFeatured shopName={shopName} products={featuredProducts} />

      <StorefrontPolicyPreview terms={terms} privacy={privacy} refund={refund} />
    </div>
  );
}
