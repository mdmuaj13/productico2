import Link from "next/link";
import type { PolicyValue } from "./types";

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
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-5 hover:bg-white dark:hover:bg-gray-900/45 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {preview ? `${preview}${preview.length >= 140 ? "…" : ""}` : "Not configured yet."}
          </div>
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
          View →
        </div>
      </div>

      {value?.lastUpdated ? (
        <div className="mt-3 text-xs text-gray-500">Last updated: {value.lastUpdated}</div>
      ) : null}
    </Link>
  );
}

export default function StorefrontPolicyPreview({
  terms,
  privacy,
  refund,
}: {
  terms?: PolicyValue;
  privacy?: PolicyValue;
  refund?: PolicyValue;
}) {
  const hasAny = Boolean(terms?.content || privacy?.content || refund?.content);
  if (!hasAny) return null;

  return (
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
        <PolicyPreviewCard title="Terms & Conditions" href="/policy?type=terms" value={terms} />
        <PolicyPreviewCard title="Privacy Policy" href="/policy?type=privacy" value={privacy} />
        <PolicyPreviewCard title="Refund Policy" href="/policy?type=refund" value={refund} />
      </div>
    </section>
  );
}
