import { NextRequest, NextResponse } from "next/server";
import dbConnect from '@/lib/db';
import { createOrderSchema } from "@/lib/validations/order";
import Order from "@/models/Order";

type CheckoutPayload = {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    notes?: string;
  };
  items: Array<{
    productId: string;
    title: string;
    slug?: string;
    image?: string;
    price: number;
    qty: number;
  }>;
  paymentType: string;
  totals: {
    subtotal: number;
    count: number;
  };
};

function generateOrderCode() {
  return `ORD-${Date.now()}`;
}

// Optional: if you need tracking code
function generateTrackingCode() {
  return `TRK-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = (await request.json()) as CheckoutPayload;

    // basic checkout validation
    if (!body?.customer?.name?.trim() || !body?.customer?.phone?.trim() || !body?.customer?.address?.trim()) {
      return NextResponse.json(
        { error: "Missing required customer fields (name, phone, address)." },
        { status: 400 }
      );
    }
    if (!Array.isArray(body?.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    // Map checkout items -> your createOrderSchema `products`
    const products = body.items.map((it) => {
      const quantity = Number(it.qty || 0);
      const price = Number(it.price || 0);
      const lineTotal = Math.max(quantity * price, 0);

      return {
        _id: String(it.productId),
        slug: String(it.slug || ""),
        title: String(it.title || ""),
        thumbnail: it.image || undefined,

        basePrice: price,
        price,
        quantity,

        variantName: null,
        variantPrice: null,
        variantSalePrice: null,

        warehouseId: null,
        lineTotal,
      };
    });

    // Build a payload that matches createOrderSchema
    const orderCandidate = {
      customerName: body.customer.name,
      customerMobile: body.customer.phone,
      customerEmail: body.customer.email || "",
      customerAddress: body.customer.address,
      customerDistrict: "",

      code: generateOrderCode(),
      trackingCode: generateTrackingCode(),

      products,

      // these must exist if schema requires them
      discount: 0,
      deliveryCost: 0,
      tax: 0,
      paid: 0,

      paymentStatus: "unpaid",
      paymentType: body.paymentType === "cash" ? "cash" : "cash",
      status: "pending",

      remark: body.customer.notes || "",
    };

    // Zod validate using the SAME schema as /api/orders
    const validationResult = createOrderSchema.safeParse(orderCandidate);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Ensure code unique (your orders route does it—do it here too)
    const existingOrder = await Order.findOne({ code: validatedData.code });
    if (existingOrder) {
      return NextResponse.json({ error: "Order code already exists" }, { status: 400 });
    }

    // Calculate totals exactly like /api/orders
    const subTotal = validatedData.products.reduce(
      (sum: number, product: { lineTotal: number }) => sum + product.lineTotal,
      0
    );

    const total =
      subTotal - validatedData.discount + validatedData.deliveryCost + validatedData.tax;

    const due = total - validatedData.paid;

    // Create
    const order = await Order.create({
      customerName: validatedData.customerName,
      customerMobile: validatedData.customerMobile,
      customerEmail: validatedData.customerEmail,
      customerAddress: validatedData.customerAddress,
      customerDistrict: validatedData.customerDistrict,
      code: validatedData.code,
      trackingCode: validatedData.trackingCode,
      products: validatedData.products,
      subTotal,
      total,
      discount: validatedData.discount,
      deliveryCost: validatedData.deliveryCost,
      tax: validatedData.tax,
      paid: validatedData.paid,
      due,
      paymentStatus: validatedData.paymentStatus,
      paymentType: validatedData.paymentType,
      status: validatedData.status,
      remark: validatedData.remark,
      createdById: validatedData.createdById,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("createdById", "name email")
      .lean();

    return NextResponse.json(populatedOrder, { status: 201 });
  } catch (error: any) {
    console.error("Error creating checkout order:", error);

    if (error?.code === 11000) {
      return NextResponse.json({ error: "Order code already exists" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Checkout failed", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
