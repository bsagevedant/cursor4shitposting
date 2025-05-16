'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface GeneratePostButtonProps {
  prompt: string;
  onPostGenerated: (post: string) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  disabled?: boolean;
  onTemplateNotice?: (notice: string, isTemplate: boolean) => void;
}

export function GeneratePostButton({
  prompt,
  onPostGenerated,
  variant = "default",
  className = "",
  disabled = false,
  onTemplateNotice,
}: GeneratePostButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePost = async () => {
    if (!prompt.trim() || disabled) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postType: prompt,
          toxicityLevel: 5,
          topic: '',
          tones: []
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate post');
      }
      
      onPostGenerated(data.content);
      
      // Check if using templates and notify parent component if callback provided
      if (data.isFromTemplate && onTemplateNotice) {
        onTemplateNotice(
          data.notice || "We're having trouble connecting to our AI service. Posts will be generated using pre-made templates until this is resolved.",
          true
        );
      }
    } catch (error) {
      console.error('Error generating post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={generatePost}
      disabled={isLoading || disabled || !prompt.trim()}
      variant={variant}
      className={className}
    >
      {isLoading ? 'Generating...' : 'Generate New Post'}
    </Button>
  );
} 