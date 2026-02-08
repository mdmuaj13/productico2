export type ApiSuccess<T> = { success: true; message: string; data: T; meta?: any };

export type Category = {
  _id: string;
  title?: string;
  name?: string;
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

export type ProductsMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};
