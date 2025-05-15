import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// This tells Next.js that this route should be handled dynamically
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('token') || '';

    if (!orderId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=missing_order_id`);
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
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=auth_failed`);
    }

    const accessToken = tokenData.access_token;

    // Capture the payment
    const captureResponse = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const captureData = await captureResponse.json();
    
    if (!captureResponse.ok) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=capture_failed`);
    }

    // Get the order details to extract custom_id
    const orderDetailsResponse = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const orderDetails = await orderDetailsResponse.json();
    
    if (!orderDetailsResponse.ok) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=order_details_failed`);
    }

    // Extract the custom_id which contains our order metadata
    const customId = orderDetails.purchase_units[0].custom_id;
    const { userId, plan, validity } = JSON.parse(customId);

    // Update user's premium status in database
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

    // Calculate premium expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(validity));

    // Update user's premium status
    const { data: userStats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If user stats don't exist, create them
      if (error.code === 'PGRST116') {
        const now = new Date().toISOString();
        await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            generation_count: 0,
            premium_until: expiryDate.toISOString(),
            last_generated_at: now,
            created_at: now,
            updated_at: now
          });
      } else {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=database_error`);
      }
    } else {
      // If user already has a premium subscription, extend it
      let newExpiryDate = expiryDate;
      if (userStats.premium_until && new Date(userStats.premium_until) > new Date()) {
        newExpiryDate = new Date(userStats.premium_until);
        newExpiryDate.setDate(newExpiryDate.getDate() + parseInt(validity));
      }

      await supabase
        .from('user_stats')
        .update({
          premium_until: newExpiryDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }

    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&expiry=${expiryDate.toISOString()}`);
    
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=unknown`);
  }
} 