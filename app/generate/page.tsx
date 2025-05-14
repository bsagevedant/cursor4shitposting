'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneratePost() {
  const [prompt, setPrompt] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implement actual post generation logic
      // This is a placeholder response
      const response = await new Promise(resolve => 
        setTimeout(() => resolve("This is a sample generated post based on your prompt."), 1000)
      );
      setGeneratedPost(response as string);
    } catch (error) {
      console.error('Error generating post:', error);
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
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? 'Generating...' : 'Generate Post'}
            </Button>
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