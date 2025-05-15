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

## Running the App

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the app. 