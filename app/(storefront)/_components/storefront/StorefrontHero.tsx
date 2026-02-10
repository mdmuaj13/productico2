import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Truck, ShieldCheck, Headphones, Mail, Phone, MapPin, ChevronRight, Store } from "lucide-react";
import type { ContactValue } from "./types";
import { IconChip, FeatureItem } from "./ui";

function formatAddress(contact?: ContactValue) {
  const parts = [contact?.address, contact?.city, contact?.country].filter(Boolean);
  return parts.join(", ");
}

export default function StorefrontHero({
  shopName,
  tagline,
  heroImage,
  contact,
}: {
  shopName: string;
  tagline: string;
  heroImage?: string;
  contact?: ContactValue;
}) {
  return (
    <section className="container mx-auto px-4 pt-8 sm:pt-10 pb-6">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30">
        {heroImage ? (
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
                  className="rounded-2xl px-5 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition inline-flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Shop now
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Link>

                <Link
                  href={contact?.email ? `mailto:${contact.email}` : "/contact"}
                  className="rounded-2xl px-5 py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent font-semibold text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition inline-flex items-center gap-2"
                >
                  <Headphones className="h-4 w-4" />
                  Contact us
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <FeatureItem icon={Truck} title="Fast delivery" desc="Quick dispatch and updates." />
                <FeatureItem icon={ShieldCheck} title="Secure checkout" desc="Reliable payments & privacy." />
                <FeatureItem icon={Headphones} title="Support" desc="Reach us anytime." />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {formatAddress(contact) ? <IconChip icon={MapPin}>{formatAddress(contact)}</IconChip> : null}
                {contact?.phone ? <IconChip icon={Phone}>{contact.phone}</IconChip> : null}
                {contact?.email ? <IconChip icon={Mail}>{contact.email}</IconChip> : null}
              </div>
            </div>

            {/* ✅ IMPORTANT: Image "fill" must be inside a relative box with size */}
            <div className="rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
              <div className="relative w-full aspect-[3/2] max-h-[360px]">
                <Image
                  src={heroImage}
                  alt={`${shopName} banner`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
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
                  className="rounded-2xl px-5 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition inline-flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Shop now
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Link>

                <Link
                  href={contact?.email ? `mailto:${contact.email}` : "/contact"}
                  className="rounded-2xl px-5 py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent font-semibold text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition inline-flex items-center gap-2"
                >
                  <Headphones className="h-4 w-4" />
                  Contact
                </Link>
              </div>
            </div>

            {contact?.phone || contact?.email || formatAddress(contact) ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {formatAddress(contact) ? <IconChip icon={MapPin}>{formatAddress(contact)}</IconChip> : null}
                {contact?.phone ? <IconChip icon={Phone}>{contact.phone}</IconChip> : null}
                {contact?.email ? <IconChip icon={Mail}>{contact.email}</IconChip> : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
