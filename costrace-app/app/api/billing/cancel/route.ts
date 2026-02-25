import { polar } from "@/lib/polar";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, resume } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 },
      );
    }

    const subscription = await polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: !resume,
      },
    });

    return NextResponse.json({
      status: subscription.status,
      cancel_at_period_end: subscription.cancelAtPeriodEnd,
      current_period_end: subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 },
    );
  }
}
