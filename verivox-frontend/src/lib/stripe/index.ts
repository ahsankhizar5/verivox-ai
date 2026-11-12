import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default stripe;

/**
 * Create Stripe checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/**
 * Create Stripe customer
 */
export async function createCustomer(email: string, name?: string) {
  return await stripe.customers.create({
    email,
    name,
  });
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  priceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  });
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Stripe Price IDs - Update these with your actual Stripe price IDs
export const STRIPE_PRICES = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
};
