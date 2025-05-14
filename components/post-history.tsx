"use client";

import { useState } from 'react';
import { usePosts } from '@/hooks/use-posts';
import { Post } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TweetCard } from '@/components/tweet-card';
import { Star, Trash2, Download, BarChart2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function PostHistory() {
  const { posts, favorites, isLoading, analytics, toggleFavorite, deletePost, exportPosts } = usePosts();
  const [selectedTab, setSelectedTab] = useState('all');

  const handleExport = () => {
    const postsToExport = selectedTab === 'favorites' ? favorites : posts;
    exportPosts(postsToExport);
    toast.success('Posts exported successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayPosts = selectedTab === 'favorites' ? favorites : posts;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Post History</CardTitle>
            <CardDescription>
              View and manage your generated posts
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export {selectedTab === 'favorites' ? 'Favorites' : 'All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites ({favorites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {displayPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No posts found
              </div>
            ) : (
              <div className="space-y-6">
                {displayPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    analytics={analytics[post.id]}
                    onToggleFavorite={() => toggleFavorite(post.id)}
                    onDelete={() => deletePost(post.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface PostCardProps {
  post: Post;
  analytics?: any;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

function PostCard({ post, analytics, onToggleFavorite, onDelete }: PostCardProps) {
  return (
    <div className="space-y-4">
      <TweetCard
        content={post.content}
        authorName={post.author_name}
        authorHandle={post.author_handle}
        toxicityLevel={post.toxicity_level}
      />
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </div>
          
          {analytics && (
            <div className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              {analytics.engagement_rate.toFixed(1)}% engagement
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className={post.is_favorite ? 'text-yellow-500' : ''}
          >
            <Star className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 