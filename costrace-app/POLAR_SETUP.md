# Polar.sh Billing Setup

## What's Been Done

✅ Added "Billing" section to the sidebar with CreditCard icon
✅ Created `/dashboard/billing` page with pricing plans
✅ Created `/api/checkout` route for server-side checkout creation
✅ Configured `polar.ts` with your access token

## Next Steps

### 1. Create Products in Polar Dashboard

Go to your [Polar Dashboard](https://polar.sh/dashboard) and create products for each plan:

- **Pro Plan** - Set price to $29/month
- Add any other plans you want to offer

### 2. Update Product IDs

After creating products, update the product IDs in:
`app/api/checkout/route.ts`

```ts
const productIds: Record<string, string> = {
  Pro: "prod_xxxxx", // Replace with your actual Polar product ID
};
```

### 3. Test the Checkout Flow

1. Navigate to `/dashboard/billing`
2. Click "Upgrade to Pro"
3. You'll be redirected to Polar's checkout (currently in sandbox mode)

### 4. Switch to Production

When ready for production, update `lib/polar.ts`:

```ts
export const api = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "production", // Change from "sandbox"
});
```

## Optional: Embedded Checkout

If you want an overlay checkout instead of redirect, check out:
https://polar.sh/docs/features/checkout/embed

You can use their `data-polar-checkout` attribute or JS SDK for inline checkout.

## Webhook Setup (Coming Soon)

To handle successful payments and update user subscriptions, you'll need to:
1. Create a webhook endpoint at `/api/webhooks/polar`
2. Configure the webhook URL in your Polar dashboard
3. Verify webhook signatures
4. Update user subscription status in your database
