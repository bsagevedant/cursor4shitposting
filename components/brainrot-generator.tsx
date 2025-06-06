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
import { ToxicityLevel, PostCategory, PostCategoryType } from '@/lib/types';
import { RefreshCw, Copy, Share2, History, Settings, BarChart2, Check, Linkedin, DollarSign, Rocket, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { usePosts } from '@/hooks/use-posts';
import { useUserStats } from '@/hooks/use-user-stats';
import { useUser } from '@/hooks/use-user';
import { PremiumUpgrade } from '@/components/premium-upgrade';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import Script from 'next/script';

// Add Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function BrainrotGenerator() {
  const { user } = useUser();
  const { savePost } = usePosts();
  const { userStats, canGenerate, decrementCredits, isPremium, creditBalance } = useUserStats();
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
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isUsingTemplates, setIsUsingTemplates] = useState(false);
  const [templateNotice, setTemplateNotice] = useState('');

  const handleSpecialMode = (mode: 'linkedin' | 'vc' | 'founder') => {
    // TODO: Implement special mode generation
    toast.info(`${mode} mode coming soon!`);
  };

  const mapSelectedCategoriesToTypes = (categories: PostCategory): PostCategoryType[] => {
    const mappings: Record<keyof PostCategory, PostCategoryType> = {
      startups: 'Startups',
      iitIim: 'IIT/IIM',
      aiMl: 'AI/ML',
      crypto: 'Crypto',
      hustle: 'Hustle',
      broCulture: 'Bro Culture'
    };

    return Object.entries(categories)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => mappings[key as keyof PostCategory]);
  };

  const handleGenerate = async () => {
    // If user isn't authenticated, show login message
    if (!user) {
      toast.error('Please sign in to generate posts');
      return;
    }

    // Check if user can generate more posts
    if (!canGenerate()) {
      toast.error('You have used all your free generations. Please upgrade to premium.');
      setActiveTab('settings');
      return;
    }

    setIsGenerating(true);
    setIsUsingTemplates(false);
    setTemplateNotice('');
    
    try {
      // Decrement credits for non-premium users
      if (!isPremium) {
        const success = await decrementCredits();
        if (!success) {
          throw new Error('Failed to decrement credits');
        }
      }
      
      // Try to generate using the AI service
      try {
        const selectedCategoryTypes = mapSelectedCategoriesToTypes(selectedCategories);
        
        // Convert toxicity level to a number
        let toxicityNumber = 5; // Default medium
        if (toxicityLevel === 'Low') toxicityNumber = 2;
        if (toxicityLevel === 'High') toxicityNumber = 8;
        
        // Call the API to generate a post
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postType: 'tech_twitter',
            toxicityLevel: toxicityNumber,
            topic: '',
            tones: selectedCategoryTypes,
          }),
        });
        
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Set the generated post content
        setGeneratedPost(data.content);
        
        // Check if this is from a template (fallback mode)
        if (data.isFromTemplate) {
          setIsUsingTemplates(true);
          setTemplateNotice(data.notice || "Using template mode");
          
          // Set author if provided from template
          if (data.author) {
            setAuthorName(data.author.name);
            setAuthorHandle(data.author.handle);
          } else {
            // Fallback to client-side template author selection
            const { author } = generateBrainrotPost(toxicityLevel, selectedCategoryTypes);
            setAuthorName(author.name);
            setAuthorHandle(author.handle);
          }
        } else {
          // Regular AI-generated post, use client-side author selection
          const { author } = generateBrainrotPost(toxicityLevel, selectedCategoryTypes);
          setAuthorName(author.name);
          setAuthorHandle(author.handle);
        }
      } catch (error) {
        console.error('Error calling API, falling back to client-side templates:', error);
        
        // Fallback to client-side generation if API fails
        const selectedCategoryTypes = mapSelectedCategoriesToTypes(selectedCategories);
        const { post, author } = generateBrainrotPost(toxicityLevel, selectedCategoryTypes);
        setGeneratedPost(post);
        setAuthorName(author.name);
        setAuthorHandle(author.handle);
        
        setIsUsingTemplates(true);
        setTemplateNotice("We're having trouble connecting to our AI service. Posts will be generated using pre-made templates until this is resolved.");
      }
    } catch (error) {
      console.error('Error generating post:', error);
      toast.error('Failed to generate post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
    const mappings: Record<keyof PostCategory, string> = {
      startups: '#startuplife',
      iitIim: '#IITian',
      aiMl: '#AIrevolution',
      crypto: '#crypto',
      hustle: '#hustlemode',
      broCulture: '#techbro'
    };

    return Object.entries(selectedCategories)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => mappings[key as keyof PostCategory])
      .filter(Boolean);
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
      if (err instanceof Error && err.message === 'Popup blocked') {
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
      const selectedCategoryTypes = mapSelectedCategoriesToTypes(selectedCategories);
      const result = await savePost({
        content: generatedPost,
        author_name: authorName,
        author_handle: authorHandle,
        toxicity_level: toxicityLevel,
        categories: selectedCategoryTypes,
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

  // Add a function to handle direct upgrade
  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade to premium');
      return;
    }

    setIsGenerating(true);

    try {
      // Create order for monthly plan (default)
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: 'monthly' }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'cursor4shitposting',
        description: 'Monthly Premium Subscription',
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                validity: 30 // Monthly plan
              }),
            });

            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            // Update premium status
            const expiryDate = new Date(verifyData.expiryDate);
            await decrementCredits();

            toast.success('Payment successful! You now have unlimited generations.');
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsGenerating(false);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        },
        theme: {
          color: '#6366F1',
        },
        modal: {
          ondismiss: function() {
            setIsGenerating(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again later.');
      setIsGenerating(false);
    }
  };

  // Generate a post on first render
  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="space-y-8 py-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 text-transparent bg-clip-text">
          cursor4shitposting
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate high-engagement, satirical shitposts crafted for Indian Tech Twitter
        </p>
        {!isPremium && (
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-orange-500 font-medium">
              {creditBalance > 0 
                ? `You have ${creditBalance} credit(s) left` 
                : 'You have used all your free generations'}
            </span>
            <Button 
              variant="link" 
              className="h-auto p-0 text-sm" 
              onClick={handleUpgrade}
              disabled={!razorpayLoaded}
            >
              {creditBalance > 0 ? 'View Premium Plans' : 'Upgrade to Premium'}
            </Button>
          </div>
        )}
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
                  disabled={!isPremium}
                >
                  {!isPremium && <Lock className="h-3 w-3 mr-1 text-orange-500" />}
                  <Linkedin className="h-4 w-4" />
                  <span className="text-foreground">LinkedIn Mode</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleSpecialMode('vc')}
                  disabled={!isPremium}
                >
                  {!isPremium && <Lock className="h-3 w-3 mr-1 text-orange-500" />}
                  <DollarSign className="h-4 w-4" />
                  <span className="text-foreground">VC Mode</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleSpecialMode('founder')}
                  disabled={!isPremium}
                >
                  {!isPremium && <Lock className="h-3 w-3 mr-1 text-orange-500" />}
                  <Rocket className="h-4 w-4" />
                  <span className="text-foreground">Founder Mode</span>
                </Button>
              </div>
              {!isPremium && (
                <p className="text-xs text-muted-foreground mt-2">
                  Special modes are available for premium users only
                </p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-medium text-foreground mb-2">Toxicity Level</h2>
              <ToxicitySlider value={toxicityLevel} onChange={setToxicityLevel} />
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

            <Button 
              className="w-full" 
              size="lg" 
              onClick={!isPremium && creditBalance === 0 ? handleUpgrade : handleGenerate}
              disabled={isGenerating || (!isPremium && creditBalance === 0 && !razorpayLoaded)}
            >
              {isGenerating 
                ? 'Processing...' 
                : !isPremium && creditBalance === 0
                  ? 'Upgrade to Generate More'
                  : 'Generate New Post'
              }
            </Button>
          </div>

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
        </TabsContent>

        <TabsContent value="history">
          <PostHistory />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid gap-6">
            <PremiumUpgrade />
            <CustomTemplates />
            <EngagementAnalytics />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}