"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Share2, MessageSquare, Repeat2, Heart } from 'lucide-react';
import { ToxicityLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

// Simple seeded random number generator
function seededRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const random = (Math.sin(hash) + 1) / 2;
  return Math.floor(random * (max - min + 1)) + min;
}

interface TweetCardProps {
  content: string;
  authorName: string;
  authorHandle: string;
  toxicityLevel: ToxicityLevel;
}

export function TweetCard({ content, authorName, authorHandle, toxicityLevel }: TweetCardProps) {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const { toast } = useToast();
  
  // Generate consistent counts based on content and author handle
  const baseSeed = `${content}${authorHandle}`;
  const likeCount = liked 
    ? seededRandom(`${baseSeed}liked`, 501, 1000)
    : seededRandom(`${baseSeed}likes`, 1, 500);
  const retweetCount = retweeted
    ? seededRandom(`${baseSeed}retweeted`, 201, 400)
    : seededRandom(`${baseSeed}retweets`, 1, 200);
  const replyCount = seededRandom(`${baseSeed}replies`, 1, 50);
  
  const getAvatarUrl = () => {
    // Return a consistent avatar for the same handle
    const seed = authorHandle.replace('@', '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  const getBadgeColor = (level: ToxicityLevel) => {
    switch(level) {
      case 'Low': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      case 'High': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "The post has been copied to your clipboard."
    });
  };

  const handleShare = () => {
    const tweetText = encodeURIComponent(content);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg border-border/50">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-accent relative">
              <img 
                src={getAvatarUrl()} 
                alt={authorName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{authorName}</div>
                <div className="text-muted-foreground text-sm">{authorHandle}</div>
              </div>
              <Badge 
                variant="outline" 
                className={cn("ml-2", getBadgeColor(toxicityLevel))}
              >
                {toxicityLevel} Spice
              </Badge>
            </div>
            
            <div className="text-base whitespace-pre-wrap">{content}</div>
            
            <div className="pt-4">
              <div className="text-sm text-muted-foreground">
                11:45 AM · Today
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 border-t border-border/50 flex flex-wrap justify-between gap-2">
        <div className="flex gap-1 sm:gap-6">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary group">
            <MessageSquare className="h-4 w-4 mr-1 group-hover:text-blue-500" /> {replyCount}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "text-muted-foreground group",
              retweeted && "text-green-500"
            )}
            onClick={() => setRetweeted(!retweeted)}
          >
            <Repeat2 className={cn(
              "h-4 w-4 mr-1",
              "group-hover:text-green-500",
              retweeted && "text-green-500"
            )} /> 
            {retweetCount.toLocaleString()}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "text-muted-foreground group",
              liked && "text-red-500"
            )}
            onClick={() => setLiked(!liked)}
          >
            <Heart className={cn(
              "h-4 w-4 mr-1",
              "group-hover:text-red-500",
              liked && "text-red-500"
            )} /> 
            {likeCount.toLocaleString()}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary" 
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-primary" 
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-1" /> Post on X
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}