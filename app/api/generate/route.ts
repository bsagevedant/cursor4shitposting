import { GoogleGenerativeAI } from '@google/generative-ai';
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
    
    // Get the prompt from the request body
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Working API key for demonstration
    const apiKey = "AIzaSyDx91LRh-gKMxhC4yxdJ6Jm-T2R3Ev-RnY";

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ generatedPost: text });
  } catch (error) {
    console.error('Error generating post:', error);
    return NextResponse.json(
      { error: 'Failed to generate post' }, 
      { status: 500 }
    );
  }
} 