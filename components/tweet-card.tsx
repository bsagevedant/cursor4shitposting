"use client";

import { Card } from '@/components/ui/card';
import { ToxicityLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Twitter } from 'lucide-react';

interface TweetCardProps {
  content: string;
  authorName: string;
  authorHandle: string;
  toxicityLevel: 'Low' | 'Medium' | 'High';
}

export function TweetCard({
  content,
  authorName,
  authorHandle,
  toxicityLevel,
}: TweetCardProps) {
  // Split content into lines for thread support
  const lines = content.split('\n\n');
  const isThread = lines.length > 1;

  // Get toxicity level color
  const toxicityColors = {
    Low: 'border-blue-500/20 bg-blue-500/5 dark:border-blue-500/30 dark:bg-blue-500/10',
    Medium: 'border-orange-500/20 bg-orange-500/5 dark:border-orange-500/30 dark:bg-orange-500/10',
    High: 'border-red-500/20 bg-red-500/5 dark:border-red-500/30 dark:bg-red-500/10',
  };

  return (
    <div className="space-y-4">
      {lines.map((line, index) => (
        <Card
          key={index}
          className={cn(
            'p-4 border-2 transition-colors',
            toxicityColors[toxicityLevel],
            isThread && index > 0 && 'ml-8'
          )}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Twitter className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-bold text-foreground">{authorName}</p>
                <p className="text-muted-foreground">{authorHandle}</p>
                {index === 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {toxicityLevel} Toxicity
                  </span>
                )}
              </div>
              
              <p className="mt-2 text-foreground whitespace-pre-wrap break-words">
                {line}
              </p>
              
              {index === 0 && (
                <div className="mt-3 flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>12:34 PM</span>
                  <span>•</span>
                  <span>Twitter for iPhone</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}