import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get user session
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            return (await cookieStore).getAll();
          },
          async setAll(cookiesToSet) {
            try {
              const resolvedCookiesStore = await cookieStore;
              cookiesToSet.forEach(({ name, value, options }) =>
                resolvedCookiesStore.set(name, value, options)
              );
            } catch (error) {
              // Handle header already sent errors
            }
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;
    const { plan } = await request.json();

    // Set amounts based on plan
    let amount, currency, validity;
    switch (plan) {
      case 'basic':
        amount = 12;
        currency = 'USD';
        validity = 30; // days
        break;
      case 'startup':
        amount = 39;
        currency = 'USD';
        validity = 30; // days
        break;
      case 'slayer':
        amount = 69;
        currency = 'USD';
        validity = 30; // days
        break;
      default:
        return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Get PayPal access token
    const tokenResponse = await fetch(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const accessToken = tokenData.access_token;

    // Create PayPal order
    const orderResponse = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toString()
            },
            description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
            custom_id: JSON.stringify({ userId, plan, validity })
          }
        ],
        application_context: {
          brand_name: 'cursor4shitposting',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paypal/capture`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
        }
      })
    });

    const orderData = await orderResponse.json();
    
    if (!orderResponse.ok) {
      throw new Error('Failed to create PayPal order');
    }

    return NextResponse.json({
      orderId: orderData.id,
      approvalUrl: orderData.links.find((link: any) => link.rel === 'approve').href
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
} 