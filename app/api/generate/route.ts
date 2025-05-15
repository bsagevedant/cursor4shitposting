import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import z from 'zod';

// Input validation schema
const generateRequestSchema = z.object({
  postType: z.string().min(1).max(100),
  toxicityLevel: z.number().int().min(0).max(10),
  topic: z.string().nullable().optional(),
  tones: z.array(z.string()).default([])
});

export async function POST(request: Request) {
  try {
    // Get user session with async cookies handling for Next.js 15
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

    // Check user's rate limit status
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError) {
      // If user stats don't exist, create them
      if (statsError.code === 'PGRST116') {
        const now = new Date().toISOString();
        await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            generation_count: 0,
            premium_until: null,
            last_generated_at: now,
            created_at: now,
            updated_at: now
          });
      } else {
        throw statsError;
      }
    } else {
      // Check if user has premium or has free generations left
      const isPremium = userStats.premium_until && new Date(userStats.premium_until) > new Date();
      const hasFreeGenerationsLeft = userStats.generation_count < 2; // 2 free generations

      if (!isPremium && !hasFreeGenerationsLeft) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please upgrade to premium.',
          needsUpgrade: true
        }, { status: 403 });
      }

      // Increment generation count for non-premium users
      if (!isPremium) {
        await supabase
          .from('user_stats')
          .update({
            generation_count: userStats.generation_count + 1,
            last_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    }
    
    // Get Gemini API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = generateRequestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Invalid request body:', validation.error);
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
    
    const { postType, toxicityLevel, topic, tones } = validation.data;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build prompt
    const prompt = `Generate a viral Twitter/X post in the style of modern viral Indian tech Twitter posts.
    
Post type: ${postType}
${topic ? `Topic: ${topic}` : ''}
Toxicity level (0-10): ${toxicityLevel} 
${tones.length > 0 ? `Tone: ${tones.join(', ')}` : ''}

Make it sound authentic, with the right amount of emojis and hashtags. Keep it within 280 characters. Don't use any placeholders. Make it feel real.

The post should embody the essence of Indian tech Twitter culture and slang, with references to startups, coding, tech companies, buzzwords, and career advice.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ content: text.trim() });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 