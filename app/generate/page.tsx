'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { GeneratePostButton } from "@/components/generate-post-button";

export default function GeneratePost() {
  const [prompt, setPrompt] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate post');
      }
      
      setGeneratedPost(data.generatedPost);
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
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Generate a Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                What kind of post would you like to generate?
              </label>
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? 'Generating...' : 'Generate Post'}
              </Button>
              {generatedPost && (
                <GeneratePostButton
                  prompt={prompt}
                  onPostGenerated={setGeneratedPost}
                  variant="outline"
                />
              )}
            </div>
          </form>

          {generatedPost && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Generated Post:</h3>
              <p className="whitespace-pre-wrap">{generatedPost}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 