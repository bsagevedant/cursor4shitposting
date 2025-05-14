"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TweetCard } from '@/components/tweet-card';
import { ToxicitySlider } from '@/components/toxicity-slider';
import { CategorySelector } from '@/components/category-selector';
import { generateBrainrotPost } from '@/lib/post-generator';
import { ToxicityLevel, PostCategory } from '@/lib/types';
import { RefreshCw } from 'lucide-react';

export function BrainrotGenerator() {
  const [toxicityLevel, setToxicityLevel] = useState<ToxicityLevel>('Medium');
  const [selectedCategories, setSelectedCategories] = useState<PostCategory[]>([
    'Startups', 'AI/ML', 'Hustle'
  ]);
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate a delay for the generation process
    setTimeout(() => {
      const { post, author } = generateBrainrotPost(toxicityLevel, selectedCategories);
      setGeneratedPost(post);
      setAuthorName(author.name);
      setAuthorHandle(author.handle);
      setIsGenerating(false);
    }, 600);
  };

  // Generate a post on first render
  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="space-y-8 py-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 text-transparent bg-clip-text">
          Brainrot Generator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate high-engagement, satirical shitposts crafted for Indian Tech Twitter
        </p>
      </header>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Toxicity Level</h2>
            <ToxicitySlider value={toxicityLevel} onChange={setToxicityLevel} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Content Categories</h2>
            <CategorySelector 
              selectedCategories={selectedCategories} 
              onChange={setSelectedCategories} 
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleGenerate} 
            size="lg" 
            className="relative group"
            disabled={isGenerating}
          >
            <RefreshCw className={`mr-2 h-4 w-4 transition-transform duration-200 ${isGenerating ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            Generate New Post
          </Button>
        </div>

        <div className="pt-6">
          <TweetCard 
            content={generatedPost} 
            authorName={authorName}
            authorHandle={authorHandle}
            toxicityLevel={toxicityLevel}
          />
        </div>
      </div>
    </div>
  );
}