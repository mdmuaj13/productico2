import Link from "next/link";
import type { Metadata } from "next";

import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Headphones,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Store,
  CarTaxiFront,
} from "lucide-react";

import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";

function SocialIconButton({
  href,
  label,
  icon: Icon,
}: {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const safeHref = href?.trim() ? href : "#";

  return (
    <a
      href={safeHref}
      target={safeHref === "#" ? undefined : "_blank"}
      rel={safeHref === "#" ? undefined : "noreferrer"}
      aria-label={label}
      className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-900 transition">
      <Icon className="h-5 w-5" />
    </a>
  );
}

type ApiSuccess<T> = { success: true; message: string; data: T; meta?: any };

type InfoValue = {
  shopName: string;
  tagline?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  heroImage?: string; // optional
  logo?: string;
};

type ContactValue = {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
};

type PolicyValue = { content: string; lastUpdated?: string };
type FeaturedValue = { productIds: string[] };

type StorefrontDoc =
  | { type: "info"; value: InfoValue }
  | { type: "contact"; value: ContactValue }
  | { type: "terms"; value: PolicyValue }
  | { type: "privacy"; value: PolicyValue }
  | { type: "refund"; value: PolicyValue }
  | { type: "featured"; value: FeaturedValue };

type StorefrontMap = Partial<Record<StorefrontDoc["type"], StorefrontDoc>>;

type Category = {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
  image?: string;
};
type Product = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  thumbnail?: string;
  images?: string[];
  categoryId?: Category;
};

function IconChip({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200">
      <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-300" />
      {children}
    </span>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/35 p-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/30 grid place-items-center">
          <Icon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function fetchStorefrontAll(): Promise<StorefrontMap> {
  const res = await fetch(`${baseUrl()}/api/storefront?type=all`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return {};
  const json = (await res.json()) as ApiSuccess<Record<string, StorefrontDoc>>;
  return (json.data || {}) as StorefrontMap;
}

async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
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

function formatAddress(contact?: ContactValue) {
  const parts = [contact?.address, contact?.city, contact?.country].filter(
    Boolean
  );
  return parts.join(", ");
}

function SocialIconLink({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-900 transition">
      {label}
    </a>
  );
}

function ProductCard({ p }: { p: Product }) {
  const img = p.thumbnail || p.images?.[0] || p.categoryId?.image || "";
  const price = p.salePrice ?? p.price;
  const categoryLabel = p.categoryId?.name || p.categoryId?.title;

  return (
    <Link
      href={`/products/${p.slug}`}
      className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 overflow-hidden hover:shadow-md transition">
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
        {categoryLabel ? (
          <div className="text-xs text-gray-500">{categoryLabel}</div>
        ) : null}

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

function PolicyPreviewCard({
  title,
  href,
  value,
}: {
  title: string;
  href: string;
  value?: PolicyValue;
}) {
  const preview = (value?.content || "").trim().slice(0, 140);
  return (
    <Link
      href={href}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-5 hover:bg-white dark:hover:bg-gray-900/45 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {title}
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {preview
              ? `${preview}${preview.length >= 140 ? "…" : ""}`
              : "Not configured yet."}
          </div>
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
          View →
        </div>
      </div>

      {value?.lastUpdated ? (
        <div className="mt-3 text-xs text-gray-500">
          Last updated: {value.lastUpdated}
        </div>
      ) : null}
    </Link>
  );
}

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
  const sf = await fetchStorefrontAll();

  const info = sf.info?.type === "info" ? sf.info.value : undefined;
  const contact = sf.contact?.type === "contact" ? sf.contact.value : undefined;
  const featured =
    sf.featured?.type === "featured" ? sf.featured.value : undefined;

  const terms = sf.terms?.type === "terms" ? sf.terms.value : undefined;
  const privacy = sf.privacy?.type === "privacy" ? sf.privacy.value : undefined;
  const refund = sf.refund?.type === "refund" ? sf.refund.value : undefined;

  const shopName = info?.shopName || "Your Store";
  const tagline = info?.tagline || "Everything you need, in one place";
  const heroImage = info?.heroImage || "";
  const logo = info?.logo || "";

  const featuredProducts = await fetchProductsByIds(featured?.productIds || []);

  const addressLine = formatAddress(contact);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-8 sm:pt-10 pb-6">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30">
          {heroImage ? (
            // ✅ BIG hero when image exists
            <div className="grid lg:grid-cols-2 gap-8 p-6 sm:p-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Open for orders
                </div>

                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {shopName}
                </h1>

                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl">
                  {tagline}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="rounded-2xl px-5 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition inline-flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Shop now
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </Link>

                  <Link
                    href={
                      contact?.email ? `mailto:${contact.email}` : "/contact"
                    }
                    className="rounded-2xl px-5 py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent font-semibold text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition inline-flex items-center gap-2">
                    <Headphones className="h-4 w-4" />
                    Contact us
                  </Link>
                </div>

                {/* Feature grid */}
                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <FeatureItem
                    icon={Truck}
                    title="Fast delivery"
                    desc="Quick dispatch and updates."
                  />
                  <FeatureItem
                    icon={ShieldCheck}
                    title="Secure checkout"
                    desc="Reliable payments & privacy."
                  />
                  <FeatureItem
                    icon={Headphones}
                    title="Support"
                    desc="Reach us anytime."
                  />
                </div>

                {/* Contact chips (icons) */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {contact?.city || contact?.country || contact?.address ? (
                    <IconChip icon={MapPin}>{formatAddress(contact)}</IconChip>
                  ) : null}
                  {contact?.phone ? (
                    <IconChip icon={Phone}>{contact.phone}</IconChip>
                  ) : null}
                  {contact?.email ? (
                    <IconChip icon={Mail}>{contact.email}</IconChip>
                  ) : null}
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
                {/* <div className="relative w-full aspect-[3/2] max-h-[360px] border"> */}
                  <Image
                    src={heroImage}
                    alt={`${shopName} banner`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover"
                  />
                {/* </div> */}
              </div>
            </div>
          ) : (
            // ✅ SMALL hero when there is NO image
            <div className="p-5 sm:p-7">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 px-3 py-1 text-xs text-gray-600 dark:text-gray-300 w-fit">
                    <Store className="h-3.5 w-3.5" />
                    Welcome
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {shopName}
                  </h1>

                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl">
                    {tagline}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <IconChip icon={Truck}>Fast delivery</IconChip>
                    <IconChip icon={ShieldCheck}>Secure checkout</IconChip>
                    <IconChip icon={Headphones}>Support</IconChip>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="rounded-2xl px-5 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition inline-flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Shop now
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </Link>

                  <Link
                    href={
                      contact?.email ? `mailto:${contact.email}` : "/contact"
                    }
                    className="rounded-2xl px-5 py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent font-semibold text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition inline-flex items-center gap-2">
                    <Headphones className="h-4 w-4" />
                    Contact
                  </Link>
                </div>
              </div>

              {/* Optional contact line under compact hero */}
              {contact?.phone || contact?.email || formatAddress(contact) ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {formatAddress(contact) ? (
                    <IconChip icon={MapPin}>{formatAddress(contact)}</IconChip>
                  ) : null}
                  {contact?.phone ? (
                    <IconChip icon={Phone}>{contact.phone}</IconChip>
                  ) : null}
                  {contact?.email ? (
                    <IconChip icon={Mail}>{contact.email}</IconChip>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Featured */}
      {featuredProducts.length ? (
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
              className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:opacity-80">
              View all →
            </Link>
          </div>

          <div className="grid gap-4 sm:gap-6 mt-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Policies preview (optional, looks good + makes SEO trust) */}
      {terms?.content || privacy?.content || refund?.content ? (
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Store policies
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Transparency builds trust—see our policies.
              </p>
            </div>
          </div>

          <div className="grid gap-4 mt-6 md:grid-cols-3">
            <PolicyPreviewCard
              title="Terms & Conditions"
              href="/policy?type=terms"
              value={terms}
            />
            <PolicyPreviewCard
              title="Privacy Policy"
              href="/policy?type=privacy"
              value={privacy}
            />
            <PolicyPreviewCard
              title="Refund Policy"
              href="/policy?type=refund"
              value={refund}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
