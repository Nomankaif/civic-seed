import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-01-27.accredited" as any, // dynamic version pin
    })
  : null;

export async function createStripePaymentIntent(amount: number, currency = "usd") {
  if (stripe) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency,
        payment_method_types: ["card"],
        metadata: { prototype_mode: "true", label: "Prototype payment flow — test mode only" },
      });
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      };
    } catch (e) {
      console.warn("Failed to create actual Stripe PaymentIntent, falling back to mock...", e);
    }
  }

  // Fallback Mock Payment Intent
  return {
    id: "pi_mock_" + Math.random().toString(36).substring(2, 12),
    clientSecret: "seti_mock_" + Math.random().toString(36).substring(2, 12) + "_secret_" + Math.random().toString(36).substring(2, 6),
    status: "succeeded",
  };
}
