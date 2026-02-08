export type CartItem = {
    productId: string;
    title: string;
    slug?: string;
    image?: string;
    price: number; // unit price
    qty: number;
    unit?: string;
  };
  
  const KEY = "cart:v1";
  
  function safeParse<T>(raw: string | null, fallback: T): T {
    try {
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  
  export function getCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    return safeParse<CartItem[]>(localStorage.getItem(KEY), []).filter(Boolean);
  }
  
  export function setCart(items: CartItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: items }));
  }
  
  export function clearCart() {
    setCart([]);
  }
  
  export function addToCart(input: CartItem) {
    const items = getCart();
    const idx = items.findIndex((x) => x.productId === input.productId);
  
    if (idx >= 0) {
      const nextQty = Math.min(99, (items[idx].qty || 1) + (input.qty || 1));
      items[idx] = { ...items[idx], qty: nextQty };
    } else {
      items.push({ ...input, qty: Math.min(99, Math.max(1, input.qty || 1)) });
    }
  
    setCart(items);
  }
  
  export function removeFromCart(productId: string) {
    const items = getCart().filter((x) => x.productId !== productId);
    setCart(items);
  }
  
  export function updateQty(productId: string, qty: number) {
    const items = getCart();
    const idx = items.findIndex((x) => x.productId === productId);
    if (idx < 0) return;
  
    const nextQty = Math.min(99, Math.max(1, qty));
    items[idx] = { ...items[idx], qty: nextQty };
    setCart(items);
  }
  
  export function cartTotals(items: CartItem[]) {
    const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
    const count = items.reduce((sum, it) => sum + (it.qty || 1), 0);
    return { subtotal, count };
  }
  