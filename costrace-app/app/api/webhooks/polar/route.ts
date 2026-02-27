import { NextRequest, NextResponse } from "next/server";

// Polar webhook events we care about
// See: https://docs.polar.sh/api-reference/webhooks
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.type;

    switch (event) {
      case "subscription.created":
      case "subscription.updated": {
        const subscription = body.data;
        const customerEmail = subscription.customer?.email;

        if (!customerEmail) break;

        await fetch(`${BACKEND_URL}/v1/webhooks/polar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            email: customerEmail,
            polar_customer_id: subscription.customer?.id,
            plan: subscription.status === "active" ? "premium" : "free",
            subscription_id: subscription.id,
          }),
        });
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        const subscription = body.data;
        const customerEmail = subscription.customer?.email;

        if (!customerEmail) break;

        await fetch(`${BACKEND_URL}/v1/webhooks/polar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            email: customerEmail,
            polar_customer_id: subscription.customer?.id,
            plan: "free",
            subscription_id: subscription.id,
          }),
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
