import { useState, useEffect } from 'react';
import { supabase } from '@/lib/db/schema';
import { UserStats } from '@/lib/db/schema';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';

export function useUserStats() {
  const { user } = useUser();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's stats
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserStats = async () => {
      try {
        // First, check if stats exist
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // If no record found, create one
          if (error.code === 'PGRST116') {
            const now = new Date().toISOString();
            const { data: newStats, error: createError } = await supabase
              .from('user_stats')
              .insert({
                user_id: user.id,
                generation_count: 0,
                premium_until: null,
                last_generated_at: now,
                created_at: now,
                updated_at: now
              })
              .select()
              .single();

            if (createError) throw createError;
            setUserStats(newStats);
          } else {
            throw error;
          }
        } else {
          setUserStats(data);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast.error('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // Check if user can generate (has free generations or is premium)
  const canGenerate = () => {
    if (!userStats) return false;

    // If user is premium, allow generation
    if (userStats.premium_until && new Date(userStats.premium_until) > new Date()) {
      return true;
    }

    // Otherwise, check generation count
    return userStats.generation_count < 2; // Allow 2 free generations
  };

  // Increment generation count
  const incrementGenerationCount = async () => {
    if (!user || !userStats) return false;

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('user_stats')
        .update({
          generation_count: userStats.generation_count + 1,
          last_generated_at: now,
          updated_at: now
        })
        .eq('id', userStats.id)
        .select()
        .single();

      if (error) throw error;

      setUserStats(data);
      return true;
    } catch (error) {
      console.error('Error updating generation count:', error);
      toast.error('Failed to update generation count');
      return false;
    }
  };

  // Set premium status
  const setPremiumStatus = async (expiryDate: Date) => {
    if (!user || !userStats) return false;

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('user_stats')
        .update({
          premium_until: expiryDate.toISOString(),
          updated_at: now
        })
        .eq('id', userStats.id)
        .select()
        .single();

      if (error) throw error;

      setUserStats(data);
      return true;
    } catch (error) {
      console.error('Error updating premium status:', error);
      toast.error('Failed to update premium status');
      return false;
    }
  };

  return {
    userStats,
    loading,
    canGenerate,
    incrementGenerationCount,
    setPremiumStatus,
    isPremium: userStats?.premium_until && new Date(userStats.premium_until) > new Date(),
    freeGenerationsUsed: userStats?.generation_count || 0,
    freeGenerationsLeft: userStats ? Math.max(0, 2 - userStats.generation_count) : 0
  };
} 