import connectDB from "@/lib/db";
import Discount from "@/models/Discount";
import { ApiSerializer } from "@/types";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    await connectDB();
    const { code } = await params;

    const discount = await Discount.findOne({
      code: code,
      deletedAt: null,
    });

    if (!discount) {
      return ApiSerializer.notFound("Discount not found");
    }

    return ApiSerializer.success(discount, "Discount retrieved successfully");
  } catch (error) {
    console.error("Error fetching discount by code:", error);
    return ApiSerializer.error("Failed to fetch discount");
  }
}
