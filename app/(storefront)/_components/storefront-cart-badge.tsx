// app/(storefront)/_components/storefront-cart-badge.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type CartItem = { qty: number };
const CART_KEY = "cart:v1";

function readCount(): number {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((sum, it: CartItem) => sum + (it?.qty || 0), 0);
  } catch {
    return 0;
  }
}

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readCount());
    sync();
    window.addEventListener("cart:updated", sync as any);
    return () => window.removeEventListener("cart:updated", sync as any);
  }, []);

  const show = useMemo(() => count > 0, [count]);
  if (!show) return null;

  return (
    <span className="ml-1 inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full text-[11px] font-bold bg-gray-900 text-white dark:bg-white dark:text-gray-900">
      {count}
    </span>
  );
}
