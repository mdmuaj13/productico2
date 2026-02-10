import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ApiSerializer } from "@/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    // Ensure model registered for populate (same pattern as you used elsewhere)
    void Category;

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const product = await Product.findOne({
      slug: decodedSlug,
      deletedAt: null,
    })
      .populate("categoryId", "name title slug image")
      .lean();

    if (!product) {
      return ApiSerializer.notFound("Product not found");
    }

    return ApiSerializer.success(product, "Product retrieved successfully");
  } catch {
    return ApiSerializer.error("Failed to retrieve product");
  }
}
