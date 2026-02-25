import { polar } from "@/lib/polar";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get("customer_id");

    if (!customerId) {
      return NextResponse.json({ items: [] });
    }

    const orders = await polar.orders.list({
      customerId: [customerId],
      sorting: ["-created_at"],
      limit: 20,
    });

    return NextResponse.json({
      items: orders.result.items.map((order) => ({
        id: order.id,
        created_at: order.createdAt,
        amount: order.totalAmount,
        currency: order.currency,
        status: order.status,
        billing_reason: order.billingReason,
        product_name: order.product?.name ?? "Pro",
      })),
    });
  } catch (error) {
    console.error("Failed to fetch billing history:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing history" },
      { status: 500 },
    );
  }
}
