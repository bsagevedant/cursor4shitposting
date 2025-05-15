# Post Generator App

## About the Gemini API Key

This app now includes a built-in Gemini API key for demonstration purposes, so you don't need to provide your own. The key is already configured in the codebase.

If you want to use your own API key in production:
1. Replace the hardcoded API key in `lib/gemini.ts` and `app/api/generate/route.ts` with your own key
2. Or set up environment variables in a `.env.local` file:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Rate Limiting & Premium Upgrades

The app now includes:
- Rate limiting that allows users to generate only 2 free posts
- Premium subscription options using Razorpay payment integration
- Monthly (₹299) and yearly (₹2,999) premium subscription plans
- Special modes available only for premium users

To configure Razorpay, add these to your `.env.local` file:
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_API_URL=https://api-m.sandbox.paypal.com  # Use https://api-m.paypal.com for production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change in production
```

## Payment Processing

The app supports two payment methods:

1. **Razorpay**: For Indian payments in INR
2. **PayPal**: For international payments in USD

To set up the payment systems:

1. Create accounts on Razorpay and PayPal Developer
2. Set up the appropriate environment variables
3. Add the necessary payment logos in the `public` directory

## Running the App

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the app. 