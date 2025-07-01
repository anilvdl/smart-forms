import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getSession } from "next-auth/react";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Map your plan IDs to Stripe price IDs
// You need to create these products/prices in your Stripe dashboard
const STRIPE_PRICE_MAP: Record<string, { monthly: string; annual: string }> = {
  'starter': {
    monthly: 'price_starter_monthly', // Replace with your actual Stripe price ID
    annual: 'price_starter_annual'     // Replace with your actual Stripe price ID
  },
  'pro': {
    monthly: 'price_pro_monthly',      // Replace with your actual Stripe price ID
    annual: 'price_pro_annual'         // Replace with your actual Stripe price ID
  },
  'starter-payu': {
    monthly: 'price_starter_payu_monthly', // Replace with your actual Stripe price ID
    annual: 'price_starter_payu_annual'    // Replace with your actual Stripe price ID
  },
  'pro-payu': {
    monthly: 'price_pro_payu_monthly',     // Replace with your actual Stripe price ID
    annual: 'price_pro_payu_annual'        // Replace with your actual Stripe price ID
  }
};

// Helper function to get Stripe price ID
function getPriceId(planId: string, billingCycle: 'monthly' | 'annual'): string {
  const planPrices = STRIPE_PRICE_MAP[planId];
  if (!planPrices) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }
  return planPrices[billingCycle];
}

// Helper function to update organization billing information
async function updateOrganizationBilling(params: {
  userId: string;
  subscriptionId: string;
  customerId: string;
  plan: string;
}) {
  const { userId, subscriptionId, customerId, plan } = params;
  
  try {
    // Call your backend API to update organization billing
    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/admin/billing/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.AUTH_SERVICE_KEY!,
      },
      body: JSON.stringify({
        userId,
        subscriptionId,
        customerId,
        plan,
        provider: 'stripe',
        status: 'active'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update organization billing');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating organization billing:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }

  const { paymentMethodId, planId, billingCycle } = req.body;

  // Validate input
  if (!paymentMethodId || !planId || !billingCycle) {
    return res.status(400).json({ 
      error: { 
        message: "Missing required fields: paymentMethodId, planId, billingCycle" 
      } 
    });
  }

  try {
    // Check if customer already exists
    let customerId: string;
    const existingCustomers = await stripe.customers.list({
      email: session.user.email!,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      // Update payment method
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name || undefined,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      customerId = customer.id;
    }

    // Get the correct Stripe price ID
    const priceId = getPriceId(planId, billingCycle);

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent };
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    // Update organization billing info in your database
    await updateOrganizationBilling({
      userId: session.user.id as string,
      subscriptionId: subscription.id,
      customerId: customerId,
      plan: planId,
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      requiresAction: paymentIntent.status === 'requires_action',
    });
  } catch (error: any) {
    console.error("Subscription error:", error);
    res.status(500).json({ 
      error: { 
        message: error.message || "Failed to create subscription" 
      } 
    });
  }
}