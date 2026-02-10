export type ApiSuccess<T> = { success: true; message: string; data: T; meta?: any };

export type InfoValue = {
  shopName: string;
  tagline?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  heroImage?: string;
  logo?: string;
};

export type ContactValue = {
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

export type PolicyValue = { content: string; lastUpdated?: string };
export type FeaturedValue = { productIds: string[] };

export type StorefrontDoc =
  | { type: "info"; value: InfoValue }
  | { type: "contact"; value: ContactValue }
  | { type: "terms"; value: PolicyValue }
  | { type: "privacy"; value: PolicyValue }
  | { type: "refund"; value: PolicyValue }
  | { type: "featured"; value: FeaturedValue };

export type StorefrontMap = Partial<Record<StorefrontDoc["type"], StorefrontDoc>>;

export type Category = {
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
  price?: number;
  salePrice?: number;
  thumbnail?: string;
  images?: string[];
  categoryId?: Category;
};
