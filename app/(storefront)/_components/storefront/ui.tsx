import type React from "react";

export function IconChip({
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

export function FeatureItem({
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

export function SocialIconButton({
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
      className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-900 transition"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}
