'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { GeneratePostButton } from "@/components/generate-post-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function GeneratePost() {
  const [prompt, setPrompt] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingTemplates, setIsUsingTemplates] = useState(false);
  const [templateNotice, setTemplateNotice] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsUsingTemplates(false);
    setTemplateNotice('');
    
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
      
      setGeneratedPost(data.content);
      
      // Check if using templates
      if (data.isFromTemplate) {
        setIsUsingTemplates(true);
        setTemplateNotice(data.notice || "Using template mode");
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

          {isUsingTemplates && templateNotice && (
            <Alert className="mt-4 bg-amber-50 border-amber-200 text-amber-800">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                {templateNotice}
              </AlertDescription>
            </Alert>
          )}

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