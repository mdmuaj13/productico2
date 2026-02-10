import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
} from "lucide-react";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

type InfoValue = {
  shopName: string;
  tagline?: string;
  metaDescription?: string;
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
  const disabled = safeHref === "#";

  return (
    <a
      href={safeHref}
      target={disabled ? undefined : "_blank"}
      rel={disabled ? undefined : "noreferrer"}
      aria-label={label}
      className={`h-10 w-10 rounded-2xl border grid place-items-center transition
        border-gray-200 dark:border-gray-800
        bg-white/70 dark:bg-gray-950/30
        text-gray-700 dark:text-gray-200
        hover:bg-white hover:shadow-sm dark:hover:bg-gray-900/40
        ${disabled ? "opacity-60" : ""}`}
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
    </Link>
  );
}

function formatAddress(c?: ContactValue) {
  return [c?.address, c?.city, c?.country].filter(Boolean).join(", ");
}

export function StorefrontFooter({
  info,
  contact,
}: {
  info?: InfoValue;
  contact?: ContactValue;
}) {
  const shopName = info?.shopName || "Your Store";
  const tagline = info?.tagline || "Everything you need, in one place";
  const logo = info?.logo;
  const description =
    info?.metaDescription ||
    "Shop confidently with fast delivery, secure checkout, and helpful support.";

  const addressLine = formatAddress(contact);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/40">

      <div className="container mx-auto px-4 py-12">

        {/* Main grid */}
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              {logo ? (
                <img
                  src={logo}
                  alt={shopName}
                  className="h-11 w-11 rounded-2xl object-cover border border-gray-200 dark:border-gray-800 bg-white"
                />
              ) : (
                <div className="h-11 w-11 rounded-2xl bg-gray-900 dark:bg-white" />
              )}

              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {shopName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {tagline}
                </div>
              </div>
            </Link>

            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
              {description}
            </p>

            <div className="flex gap-2 pt-1">
              <SocialIconButton icon={Facebook} label="Facebook" href={contact?.socialLinks?.facebook} />
              <SocialIconButton icon={Instagram} label="Instagram" href={contact?.socialLinks?.instagram} />
              <SocialIconButton icon={Twitter} label="Twitter" href={contact?.socialLinks?.twitter} />
              <SocialIconButton icon={Linkedin} label="LinkedIn" href={contact?.socialLinks?.linkedin} />
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-3">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Shop</div>
            <div className="mt-4 flex flex-col gap-3">
              <FooterLink href="/products">All products</FooterLink>
              <FooterLink href="/cart">Cart</FooterLink>
              <FooterLink href="/checkout">Checkout</FooterLink>
              <FooterLink href="/app/dashboard">Admin</FooterLink>
            </div>
          </div>

          {/* Policies */}
          <div className="md:col-span-2">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Policies</div>
            <div className="mt-4 flex flex-col gap-3">
              <FooterLink href="/policy?type=terms">Terms</FooterLink>
              <FooterLink href="/policy?type=privacy">Privacy</FooterLink>
              <FooterLink href="/policy?type=refund">Refund</FooterLink>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-2 space-y-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Contact</div>

            {contact?.email && (
              <ContactRow icon={Mail} href={`mailto:${contact.email}`}>
                {contact.email}
              </ContactRow>
            )}
            {contact?.phone && (
              <ContactRow icon={Phone} href={`tel:${contact.phone}`}>
                {contact.phone}
              </ContactRow>
            )}
            {addressLine && (
              <ContactRow icon={MapPin}>{addressLine}</ContactRow>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-gray-500">
          <div>© {year} {shopName}. All rights reserved.</div>

          <div className="flex gap-4">
            <Link href="/policy?type=terms" className="hover:text-gray-700 dark:hover:text-gray-200">
              Terms
            </Link>
            <Link href="/policy?type=privacy" className="hover:text-gray-700 dark:hover:text-gray-200">
              Privacy
            </Link>
            <Link href="/policy?type=refund" className="hover:text-gray-700 dark:hover:text-gray-200">
              Refund
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* helpers */

function TrustItem({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/30 grid place-items-center">
        <Icon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  children,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  href?: string;
}) {
  const row = (
    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
      <Icon className="h-4 w-4 mt-0.5 text-gray-700 dark:text-gray-200" />
      <span>{children}</span>
    </div>
  );

  if (!href) return row;

  return (
    <a href={href} className="hover:opacity-90 transition">
      {row}
    </a>
  );
}
