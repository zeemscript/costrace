"use client";

import { getCurrentUser } from "@/api/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUserStore } from "@/stores/user-store";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  billing_reason: string;
  product_name: string;
}

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "",
    description: "For side projects and experimentation",
    features: [
      "50,000 traces per month",
      "7-day data retention",
      "1 API key",
      "1 budget alert",
      "Email alerts",
      "All providers supported",
      "Cost breakdown by model",
    ],
    cta: "Current plan",
  },
  {
    id: "premium" as const,
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For teams shipping AI to production",
    features: [
      "500,000 traces per month",
      "90-day data retention",
      "Unlimited API keys",
      "Unlimited budget alerts",
      "Email + Slack + Webhooks",
      "All providers supported",
      "Cost breakdown by model",
      "Geographic distribution",
      "Team members",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
  },
];

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function billingReasonLabel(reason: string) {
  switch (reason) {
    case "subscription_create":
      return "New subscription";
    case "subscription_cycle":
      return "Renewal";
    case "subscription_update":
      return "Plan change";
    case "purchase":
      return "Purchase";
    default:
      return reason;
  }
}

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { user, token, setAuth } = useUserStore();
  const searchParams = useSearchParams();
  const currentPlan = user?.plan || "free";
  const isCancelingAtPeriodEnd = user?.cancel_at_period_end ?? false;
  const currentPeriodEnd = user?.current_period_end;
  const checkoutRef = useRef<Awaited<
    ReturnType<typeof PolarEmbedCheckout.create>
  > | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.polar_customer_id) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(
        `/api/billing/history?customer_id=${user.polar_customer_id}`,
      );
      const data = await res.json();
      setOrders(data.items || []);
    } catch {
      // silently fail — history is non-critical
    } finally {
      setOrdersLoading(false);
    }
  }, [user?.polar_customer_id]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated! Welcome to Pro.");
      refreshUser();
      fetchOrders();
    }
  }, [searchParams]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    return () => {
      checkoutRef.current?.close();
    };
  }, []);

  async function refreshUser() {
    try {
      const { data } = await getCurrentUser();
      if (token) setAuth(data, token);
    } catch {
      // ignore
    }
  }

  async function handleCheckout(planId: string) {
    if (planId === "free" || planId === currentPlan) return;

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: "Pro", email: user?.email }),
      });

      const data = await response.json();

      if (!data.checkoutUrl) {
        throw new Error("No checkout URL returned");
      }

      // Open embedded checkout modal
      const checkout = await PolarEmbedCheckout.create(data.checkoutUrl, {
        theme: "dark",
      });
      checkoutRef.current = checkout;

      checkout.addEventListener("success", async () => {
        toast.success("Subscription activated! Welcome to Pro.");
        await refreshUser();
        fetchOrders();
      });

      checkout.addEventListener("close", () => {
        checkoutRef.current = null;
        setLoading(false);
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout");
      setLoading(false);
    }
  }

  async function handleCancelConfirm() {
    if (!user?.polar_subscription_id) return;

    setCanceling(true);
    setShowCancelDialog(false);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: user.polar_subscription_id,
        }),
      });

      if (!res.ok) throw new Error("Cancel failed");

      toast.success(
        "Subscription set to cancel at end of billing period",
      );
      await refreshUser();
      fetchOrders();
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setCanceling(false);
    }
  }

  async function handleResumeSubscription() {
    if (!user?.polar_subscription_id) return;

    setResuming(true);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: user.polar_subscription_id,
          resume: true,
        }),
      });

      if (!res.ok) throw new Error("Resume failed");

      toast.success("Subscription resumed");
      await refreshUser();
    } catch (error) {
      console.error("Resume error:", error);
      toast.error("Failed to resume subscription");
    } finally {
      setResuming(false);
    }
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-6 backdrop-blur-sm">
        <SidebarTrigger className="-ml-2 md:hidden" />
        <h1 className="text-sm font-semibold">Billing</h1>
      </header>

      <div className="flex-1 p-3">
        <div className="mx-auto max-w-9xl space-y-3">
          {/* Current Plan */}
          <section className="rounded-xs border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Current Plan</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You are on the{" "}
                  <span className="font-medium text-foreground">
                    {currentPlan === "premium" ? "Pro" : "Free"}
                  </span>{" "}
                  plan
                </p>
              </div>
              {currentPlan === "premium" && (
                <span className="inline-flex items-center gap-1.5 rounded-xs bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  <Sparkles className="size-3" />
                  Pro
                </span>
              )}
            </div>

            {/* Cancellation banner */}
            {currentPlan === "premium" && isCancelingAtPeriodEnd && (
              <div className="mt-4 flex items-start gap-3 rounded-xs border border-amber-500/20 bg-amber-500/5 p-4">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <div className="flex-1">
                  <p className="text-sm text-amber-200">
                    Your subscription is set to cancel
                    {currentPeriodEnd
                      ? ` on ${formatDate(currentPeriodEnd)}`
                      : " at the end of your billing period"}
                    . You&apos;ll retain Pro features until then.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 rounded-xs"
                    disabled={resuming}
                    onClick={handleResumeSubscription}
                  >
                    {resuming ? "Resuming..." : "Resume Subscription"}
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Plans */}
          <section className="grid gap-3 md:grid-cols-2">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const isUpgrade = plan.id === "premium" && currentPlan === "free";

              return (
                <div
                  key={plan.id}
                  className={`rounded-xs border bg-card p-6 ${
                    isCurrent ? "border-emerald-500/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{plan.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="rounded-xs bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-0.5">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                        <span className="text-xs text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Button
                      className="w-full rounded-xs"
                      variant={isUpgrade ? "default" : "outline"}
                      size="sm"
                      disabled={isCurrent || loading}
                      onClick={() => handleCheckout(plan.id)}
                    >
                      {loading && isUpgrade
                        ? "Loading..."
                        : isCurrent
                          ? "Current plan"
                          : plan.cta}
                    </Button>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Payment History */}
          <section className="rounded-xs border bg-card p-6">
            <h2 className="text-base font-semibold">Payment History</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your past invoices and payments
            </p>

            <div className="mt-4">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-xs border py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No payment history yet
                  </p>
                </div>
              ) : (
                <div className="rounded-xs border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium">Date</th>
                        <th className="px-4 py-2.5 font-medium">Description</th>
                        <th className="px-4 py-2.5 font-medium">Amount</th>
                        <th className="px-4 py-2.5 font-medium text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0">
                          <td className="px-4 py-3 text-xs">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="text-foreground">
                              {order.product_name}
                            </span>
                            <span className="ml-1.5 text-muted-foreground">
                              &middot;{" "}
                              {billingReasonLabel(order.billing_reason)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {formatCurrency(order.amount, order.currency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-block rounded-xs px-2 py-0.5 text-[11px] font-medium ${
                                order.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : order.status === "refunded"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-zinc-500/10 text-zinc-400"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Manage / Cancel Subscription */}
          {currentPlan === "premium" && !isCancelingAtPeriodEnd && (
            <section className="rounded-xs border border-red-500/20 bg-card p-6">
              <h2 className="text-base font-semibold">Manage Subscription</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update payment method or manage your subscription through Polar.
                Canceling will let you keep Pro features until the end of your
                billing period.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xs"
                  onClick={() =>
                    window.open(
                      "https://polar.sh/settings/subscriptions",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="mr-1.5 size-3.5" />
                  Manage on Polar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-xs"
                  disabled={canceling}
                  onClick={() => setShowCancelDialog(true)}
                >
                  {canceling ? "Canceling..." : "Cancel Subscription"}
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? Your Pro
              features will remain active until the end of your current billing
              period
              {currentPeriodEnd ? ` (${formatDate(currentPeriodEnd)})` : ""}.
              After that, you&apos;ll be downgraded to the Free plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
