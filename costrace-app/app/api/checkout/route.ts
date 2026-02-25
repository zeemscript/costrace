import { polar } from "@/lib/polar";
import { NextRequest, NextResponse } from "next/server";

const productIds: Record<string, string> = {
  Pro: "4cb2a5f1-f1a3-40b5-99de-6c499a995275",
};

export async function POST(req: NextRequest) {
  try {
    const { planName, email } = await req.json();

    const productId = productIds[planName];
    if (!productId) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 },
      );
    }

    const origin = req.nextUrl.origin;

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${origin}/dashboard/billing?success=true`,
      customerEmail: email || undefined,
      embedOrigin: origin,
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
