import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Initialize Razorpay with your key_id and key_secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, validity } = await request.json();

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Fetch order details to get plan info
    const order = await razorpay.orders.fetch(razorpay_order_id);
    
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
        throw error;
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

    // Save payment details in a separate payments table if needed
    // This is optional for future reference
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment verified and premium status updated',
      expiryDate: expiryDate.toISOString()
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 