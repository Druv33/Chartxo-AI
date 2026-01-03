
import Stripe from 'https://esm.sh/stripe@12.1.1?target=deno'
import Razorpay from 'https://esm.sh/razorpay@2.8.4?target=deno'

// Standard CORS headers required for Supabase Edge Functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
}

// Deno type definitions for the Edge environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight Handshake (Critical for "Failed to send request" error)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    // 2. Extract Secrets from Supabase Dashboard
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!STRIPE_SECRET_KEY || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Server Config Error: Payment API keys are missing in Supabase Secrets.')
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })
    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })

    // 3. Parse Request
    const { plan, gateway, userId, userEmail } = await req.json()
    
    // Pricing: Starter $9, Lifetime $149
    const amount = plan === 'starter' ? 9 : 149

    if (gateway === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { 
              name: `Chartxo ${plan.toUpperCase()}`,
              description: plan === 'starter' ? 'Unlimited Monthly AI Scan Access' : 'Lifetime VIP AI Access'
            },
            unit_amount: amount * 100, // Cents
            recurring: plan === 'starter' ? { interval: 'month' } : undefined,
          },
          quantity: 1,
        }],
        mode: plan === 'starter' ? 'subscription' : 'payment',
        success_url: `https://mjnblxlyajvgdypdviag.supabase.co/success`, 
        cancel_url: `https://mjnblxlyajvgdypdviag.supabase.co/cancel`,
        customer_email: userEmail,
        metadata: { userId, planTier: plan },
      })

      return new Response(JSON.stringify({ sessionId: session.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })

    } else if (gateway === 'razorpay') {
      const order = await razorpay.orders.create({
        amount: amount * 100, // Smallest currency unit
        currency: 'USD',
        receipt: `order_rcpt_${userId}_${Date.now()}`,
        notes: { userId, planTier: plan }
      })

      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    throw new Error('Invalid payment gateway.')

  } catch (error: any) {
    console.error('[Edge Function Runtime Error]:', error.message)
    // CRITICAL: Always return CORS headers on error or the client gets a "Network Error"
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
