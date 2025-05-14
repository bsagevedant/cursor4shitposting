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
import { RefreshCw, Copy, Share2, History, Settings, BarChart2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { usePosts } from '@/hooks/use-posts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BrainrotGenerator() {
  const { savePost } = usePosts();
  const [toxicityLevel, setToxicityLevel] = useState<ToxicityLevel>('Medium');
  const [selectedCategories, setSelectedCategories] = useState<PostCategory[]>([
    'Startups', 'AI/ML', 'Hustle'
  ]);
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
      const { post, author } = generateBrainrotPost(toxicityLevel, selectedCategories);
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
    const hashtags = selectedCategories.map(category => {
      switch(category) {
        case 'Startups': return '#startuplife';
        case 'AI/ML': return '#AIrevolution';
        case 'Hustle': return '#hustlemode';
        case 'IIT/IIM': return '#IITian';
        case 'Crypto': return '#crypto';
        case 'Bro Culture': return '#techbro';
        default: return '';
      }
    }).filter(Boolean);

    return hashtags.slice(0, 3).join(' '); // Limit to 3 hashtags
  };

  const shortenText = (text: string, maxLength: number = 280) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const handleShare = async () => {
    try {
      const hashtags = generateHashtags();
      const textToShare = shortenText(`${generatedPost}\n\n${hashtags}`);
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
      const hashtags = generateHashtags().split(' ');
      const result = await savePost({
        content: generatedPost,
        author_name: authorName,
        author_handle: authorHandle,
        toxicity_level: toxicityLevel,
        categories: selectedCategories,
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

          {generatedPost && (
            <div className="pt-6 space-y-4">
              <TweetCard 
                content={generatedPost} 
                authorName={authorName}
                authorHandle={authorHandle}
                toxicityLevel={toxicityLevel}
              />
              
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCopy}
                  className="group relative"
                  disabled={isCopying}
                >
                  {isCopying ? (
                    <div className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Copied!
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Copy className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      Copy Post
                    </div>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="group"
                >
                  <Share2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Share on X
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSave}
                  className="group relative"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <BarChart2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      Save & Track
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="pt-8">
            <SpecialModeSelector toxicityLevel={toxicityLevel} />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <PostHistory />
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <CustomTemplates />
            <EngagementAnalytics
              data={{
                views: 1234,
                likes: 567,
                retweets: 89,
                replies: 45,
                engagement_rate: 4.5,
                best_performing_time: '9:00 PM',
                hourly_engagement: Array.from({ length: 24 }, (_, i) => ({
                  hour: i,
                  engagement: Math.random() * 10
                })),
                category_performance: [
                  { category: 'Startups', engagement: 8.5 },
                  { category: 'AI/ML', engagement: 7.2 },
                  { category: 'Hustle', engagement: 6.8 },
                  { category: 'IIT/IIM', engagement: 9.1 },
                  { category: 'Crypto', engagement: 5.4 }
                ]
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}