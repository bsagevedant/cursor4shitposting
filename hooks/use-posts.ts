import { useState, useEffect } from 'react';
import { supabase } from '@/lib/db/schema';
import { Post, Analytics } from '@/lib/db/schema';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';

export function usePosts() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [favorites, setFavorites] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Record<string, Analytics>>({});

  // Fetch user's posts
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
        setFavorites(data?.filter(post => post.is_favorite) || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  // Save a new post
  const savePost = async (post: Omit<Post, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      toast.error('Please sign in to save posts');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...post,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setPosts(prev => [data, ...prev]);
      if (data.is_favorite) {
        setFavorites(prev => [data, ...prev]);
      }

      toast.success('Post saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
      return null;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to favorite posts');
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      const { data, error } = await supabase
        .from('posts')
        .update({ is_favorite: !post.is_favorite })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;

      setPosts(prev => prev.map(p => p.id === postId ? data : p));
      setFavorites(prev => 
        data.is_favorite 
          ? [data, ...prev]
          : prev.filter(p => p.id !== postId)
      );

      toast.success(data.is_favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  // Delete a post
  const deletePost = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to delete posts');
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      setFavorites(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Get analytics for a post
  const getAnalytics = async (postId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('post_id', postId)
        .single();

      if (error) throw error;

      setAnalytics(prev => ({
        ...prev,
        [postId]: data
      }));

      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  };

  // Export posts as CSV
  const exportPosts = (postsToExport: Post[] = posts) => {
    const headers = ['Content', 'Author', 'Handle', 'Toxicity', 'Categories', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...postsToExport.map(post => [
        `"${post.content.replace(/"/g, '""')}"`,
        post.author_name,
        post.author_handle,
        post.toxicity_level,
        post.categories.join(';'),
        post.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `brainrot-posts-${new Date().toISOString()}.csv`;
    link.click();
  };

  return {
    posts,
    favorites,
    isLoading,
    analytics,
    savePost,
    toggleFavorite,
    deletePost,
    getAnalytics,
    exportPosts
  };
} 