// app/api/products/by-ids/route.ts
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ApiSerializer } from "@/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const idsParam = request.nextUrl.searchParams.get("ids") || "";
    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!ids.length) {
      return ApiSerializer.success([], "No ids provided");
    }

    const products = await Product.find({
      _id: { $in: ids },
      deletedAt: null,
    }).populate("categoryId", "name slug");

    // Keep the same order as featured.productIds
    const order = new Map(ids.map((id, idx) => [id, idx]));
    const sorted = [...products].sort((a: any, b: any) => {
      return (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0);
    });

    return ApiSerializer.success(sorted, "Products retrieved successfully");
  } catch {
    return ApiSerializer.error("Failed to retrieve products");
  }
}
