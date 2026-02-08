"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";

type Category = {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
  image?: string;
};

export type Product = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  shortDetail?: string;
  price?: number;
  salePrice?: number;
  unit?: string;
  tags?: string[];
  thumbnail?: string;
  images?: string[];
  categoryId?: Category;
  variants?: any[];
};

type Props = {
  product: Product;
  images: string[];
  mode: "gallery" | "purchase";
};

type CartItem = {
  productId: string;
  title: string;
  slug?: string;
  image?: string;
  price: number; // unit price
  qty: number;
};

const CART_KEY = "cart:v1";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function unitPriceOf(p: Product) {
  const n = typeof p.salePrice === "number" ? p.salePrice : p.price;
  return typeof n === "number" && n > 0 ? n : 0;
}

function formatMoney(n: number) {
  return `৳ ${n.toLocaleString()}`;
}

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // notify other UI (header badge, cart page, etc.)
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: items }));
}

function addItemToCart(item: CartItem) {
  const cart = readCart();
  const idx = cart.findIndex((x) => x.productId === item.productId);

  if (idx >= 0) {
    const nextQty = clamp((cart[idx].qty || 1) + item.qty, 1, 99);
    cart[idx] = { ...cart[idx], qty: nextQty };
  } else {
    cart.push({ ...item, qty: clamp(item.qty || 1, 1, 99) });
  }

  writeCart(cart);
}

function buildCartItem(product: Product, image: string | undefined, qty: number): CartItem {
  return {
    productId: product._id,
    title: product.title,
    slug: product.slug,
    image,
    price: unitPriceOf(product),
    qty: clamp(qty, 1, 99),
  };
}

export default function ProductClient({ product, images, mode }: Props) {
  const router = useRouter();

  const safeImages = useMemo(() => (images ?? []).filter(Boolean), [images]);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  const unitPrice = unitPriceOf(product);
  const total = unitPrice * qty;

  const canBuy = unitPrice > 0;

  function dec() {
    setQty((q) => clamp(q - 1, 1, 99));
  }

  function inc() {
    setQty((q) => clamp(q + 1, 1, 99));
  }

  function addToCart() {
    if (!canBuy) return;
    addItemToCart(buildCartItem(product, safeImages[0], qty));
  }

  function buyNow() {
    addToCart();
    router.push("/checkout");
  }

  if (mode === "gallery") {
    const current = safeImages[active];

    return (
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 overflow-hidden">
        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800">
          {current ? (
            <img
              src={current}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                No image
              </div>
            </div>
          )}
        </div>

        {safeImages.length > 1 ? (
          <div className="p-4 border-t border-gray-200/70 dark:border-gray-800">
            <div className="flex gap-3 overflow-x-auto">
              {safeImages.slice(0, 12).map((src, i) => {
                const activeThumb = i === active;

                return (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Image ${i + 1}`}
                    className={[
                      "shrink-0 rounded-2xl overflow-hidden border bg-gray-100 dark:bg-gray-800 transition",
                      activeThumb
                        ? "border-gray-900 dark:border-white"
                        : "border-gray-200 dark:border-gray-700 hover:opacity-90",
                    ].join(" ")}
                  >
                    <img
                      src={src}
                      alt="Thumbnail"
                      className="h-16 w-24 object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // purchase mode
  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs text-gray-500">Price</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {canBuy ? formatMoney(unitPrice) : "—"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Total</div>
          <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {canBuy ? formatMoney(total) : "—"}
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          Quantity
        </div>

        <div className="inline-flex items-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/30 overflow-hidden">
          <button
            type="button"
            onClick={dec}
            disabled={!canBuy || qty <= 1}
            className="h-10 w-10 grid place-items-center hover:bg-gray-50 dark:hover:bg-gray-900/40 transition disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="h-10 min-w-[52px] grid place-items-center text-sm font-semibold text-gray-900 dark:text-white">
            {qty}
          </div>

          <button
            type="button"
            onClick={inc}
            disabled={!canBuy || qty >= 99}
            className="h-10 w-10 grid place-items-center hover:bg-gray-50 dark:hover:bg-gray-900/40 transition disabled:opacity-50"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={addToCart}
          disabled={!canBuy}
          className="rounded-2xl px-4 py-3 font-semibold text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/40 transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </button>

        <button
          type="button"
          onClick={buyNow}
          disabled={!canBuy}
          className="rounded-2xl px-4 py-3 font-semibold text-sm bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CreditCard className="h-4 w-4" />
          Buy now
        </button>
      </div>

      {!canBuy ? (
        <div className="mt-4 text-xs text-amber-700 dark:text-amber-300">
          This product doesn’t have a valid price yet.
        </div>
      ) : (
        <div className="mt-4 text-xs text-gray-500">
          Tip: Later you can replace localStorage cart with your DB/cart API
          without changing the UI.
        </div>
      )}
    </div>
  );
}
