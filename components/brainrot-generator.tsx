"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TweetCard } from '@/components/tweet-card';
import { ToxicitySlider } from '@/components/toxicity-slider';
import { CategorySelector } from '@/components/category-selector';
import { SpecialModeSelector } from '@/components/special-mode-selector';
import { PostHistory } from '@/components/post-history';
import { CustomTemplates } from '@/components/custom-templates';
import { EngagementAnalytics } from '@/components/engagement-analytics';
import { generateBrainrotPost } from '@/lib/post-generator';
import { ToxicityLevel, PostCategory } from '@/lib/types';
import { RefreshCw, Copy, Share2, History, Settings, BarChart2, Check, Linkedin, DollarSign, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { usePosts } from '@/hooks/use-posts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

export function BrainrotGenerator() {
  const { savePost } = usePosts();
  const [toxicityLevel, setToxicityLevel] = useState<ToxicityLevel>('Medium');
  const [selectedCategories, setSelectedCategories] = useState<PostCategory>({
    startups: true,
    iitIim: true,
    aiMl: true,
    crypto: true,
    hustle: true,
    broCulture: true
  });
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [activeTab, setActiveTab] = useState('generate');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate a delay for the generation process
    setTimeout(() => {
      const { post, author } = generateBrainrotPost(toxicityLevel, Object.keys(selectedCategories).filter(key => selectedCategories[key as keyof PostCategory]) as PostCategory[]);
      setGeneratedPost(post);
      setAuthorName(author.name);
      setAuthorHandle(author.handle);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(generatedPost);
      toast.success('Post copied to clipboard!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast.error('Failed to copy post. Please try again or copy manually.');
    } finally {
      setIsCopying(false);
      // Reset after 2 seconds
      setTimeout(() => setIsCopying(false), 2000);
    }
  };

  const generateHashtags = () => {
    const hashtags = Object.keys(selectedCategories).filter(key => selectedCategories[key as keyof PostCategory]) as PostCategory[];
    return hashtags.map(category => {
      switch(category) {
        case 'startups': return '#startuplife';
        case 'iitIim': return '#IITian';
        case 'aiMl': return '#AIrevolution';
        case 'crypto': return '#crypto';
        case 'hustle': return '#hustlemode';
        case 'broCulture': return '#techbro';
        default: return '';
      }
    }).filter(Boolean);
  };

  const shortenText = (text: string, maxLength: number = 280) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const handleShare = async () => {
    try {
      const hashtags = generateHashtags();
      const textToShare = shortenText(`${generatedPost}\n\n${hashtags.join(' ')}`);
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
      
      const windowFeatures = 'width=550,height=420,scrollbars=yes,resizable=yes';
      const shareWindow = window.open(url, '_blank', windowFeatures);
      
      if (!shareWindow) {
        throw new Error('Popup blocked');
      }
    } catch (err) {
      console.error('Error sharing post:', err);
      if (err.message === 'Popup blocked') {
        toast.error('Please allow popups to share on X');
      } else {
        toast.error('Failed to share post. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    if (!generatedPost) return;
    setIsSaving(true);

    try {
      const hashtags = generateHashtags();
      const result = await savePost({
        content: generatedPost,
        author_name: authorName,
        author_handle: authorHandle,
        toxicity_level: toxicityLevel,
        categories: Object.keys(selectedCategories).filter(key => selectedCategories[key as keyof PostCategory]) as PostCategory[],
        is_favorite: false,
        engagement_score: 0,
        metadata: {
          hashtags,
          thread_length: generatedPost.split('\n\n').length,
          best_time_to_post: new Date().toISOString(), // We'll improve this later
          estimated_reach: Math.floor(Math.random() * 1000) + 500 // Placeholder
        }
      });

      if (!result && retryCount < maxRetries) {
        throw new Error('Save failed');
      }

      toast.success('Post saved successfully!');
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error saving post:', err);
      
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        toast.error(`Save failed. Retrying... (Attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => handleSave(), 1000); // Retry after 1 second
      } else {
        toast.error('Failed to save post after multiple attempts. Please try again later.');
        setRetryCount(0); // Reset retry count
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Generate a post on first render
  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="space-y-8 py-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 text-transparent bg-clip-text">
          cursor4shitposting
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate high-engagement, satirical shitposts crafted for Indian Tech Twitter
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-2">Special Modes</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleSpecialMode('linkedin')}
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="text-foreground">LinkedIn Mode</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleSpecialMode('vc')}
                >
                  <DollarSign className="h-4 w-4" />
                  <span className="text-foreground">VC Mode</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleSpecialMode('founder')}
                >
                  <Rocket className="h-4 w-4" />
                  <span className="text-foreground">Founder Mode</span>
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-foreground mb-2">Content Categories</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCategories.startups}
                    onCheckedChange={(checked) => 
                      setSelectedCategories(prev => ({...prev, startups: checked as boolean}))}
                  />
                  <label className="text-foreground">🚀 Startups</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCategories.iitIim}
                    onCheckedChange={(checked) => 
                      setSelectedCategories(prev => ({...prev, iitIim: checked as boolean}))}
                  />
                  <label className="text-foreground">🎓 IIT/IIM</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCategories.aiMl}
                    onCheckedChange={(checked) => 
                      setSelectedCategories(prev => ({...prev, aiMl: checked as boolean}))}
                  />
                  <label className="text-foreground">🤖 AI/ML</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCategories.crypto}
                    onCheckedChange={(checked) => 
                      setSelectedCategories(prev => ({...prev, crypto: checked as boolean}))}
                  />
                  <label className="text-foreground">💰 Crypto</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCategories.hustle}
                    onCheckedChange={(checked) => 
                      setSelectedCategories(prev => ({...prev, hustle: checked as boolean}))}
                  />
                  <label className="text-foreground">💪 Hustle</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCategories.broCulture}
                    onCheckedChange={(checked) => 
                      setSelectedCategories(prev => ({...prev, broCulture: checked as boolean}))}
                  />
                  <label className="text-foreground">🏋️ Bro Culture</label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-foreground mb-2">Toxicity Level</h2>
              <ToxicitySlider value={toxicityLevel} onChange={setToxicityLevel} />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
            >
              Generate Shitpost
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <PostHistory />
        </TabsContent>

        <TabsContent value="settings">
          <CustomTemplates />
        </TabsContent>
      </Tabs>

      {generatedPost && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-foreground mb-4">Generated Tweet</h2>
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