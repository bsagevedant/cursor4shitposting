import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
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
          get(name: string) {
            return cookieStore.get(name)?.value;
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

    // Create order
    const options = {
      amount: amount * 100, // Razorpay expects amount in cents
      currency,
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        userId,
        plan,
        validity
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
} 