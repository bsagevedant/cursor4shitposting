"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { SpecialMode, specialModes, generateSpecialModePost } from '@/lib/special-modes';
import { ToxicityLevel } from '@/lib/types';
import { TweetCard } from '@/components/tweet-card';
import { RefreshCw } from 'lucide-react';

interface SpecialModeSelectorProps {
  toxicityLevel: ToxicityLevel;
}

export function SpecialModeSelector({ toxicityLevel }: SpecialModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<SpecialMode | null>(null);
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');

  const handleGenerate = () => {
    if (!selectedMode) return;
    
    setIsGenerating(true);
    
    // Simulate a delay for the generation process
    setTimeout(() => {
      const post = generateSpecialModePost(selectedMode, toxicityLevel);
      setGeneratedPost(post);
      
      // Set a random author based on the mode
      const authors = {
        FounderMeltdown: { name: "Rahul Founder", handle: "@RahulFounderAI" },
        FakeVCTakes: { name: "Vikram Ventures", handle: "@TheVikramVC" },
        IITBaitThread: { name: "Karan Mehra", handle: "@KaranMehraIIT" }
      };
      
      setAuthorName(authors[selectedMode].name);
      setAuthorHandle(authors[selectedMode].handle);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Special Modes</CardTitle>
          <CardDescription>
            Generate specialized content for maximum engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedMode || ''}
            onValueChange={(value) => setSelectedMode(value as SpecialMode)}
            className="space-y-4"
          >
            {Object.entries(specialModes).map(([mode, data]) => (
              <div key={mode} className="flex items-start space-x-3">
                <RadioGroupItem value={mode} id={mode} />
                <div className="space-y-1">
                  <Label htmlFor={mode} className="font-medium">
                    {data.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {data.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleGenerate}
              size="lg"
              className="relative group"
              disabled={!selectedMode || isGenerating}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 transition-transform duration-200 ${
                  isGenerating ? 'animate-spin' : 'group-hover:rotate-180'
                }`}
              />
              Generate Special Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedPost && (
        <div className="pt-6">
          <TweetCard
            content={generatedPost}
            authorName={authorName}
            authorHandle={authorHandle}
            toxicityLevel={toxicityLevel}
          />
        </div>
      )}
    </div>
  );
} 