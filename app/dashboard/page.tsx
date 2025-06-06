'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, CopyIcon, RefreshCw, Share2, UserCircle, LogOut, Crown, Lock, Sparkles, HistoryIcon, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generatePost, testGeminiApiKey } from '@/lib/gemini'
import { generateBrainrotPost } from '@/lib/post-generator'
import { useUser } from "@/hooks/use-user"
import { useUserStats } from "@/hooks/use-user-stats"
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { WelcomeModal } from "@/components/welcome-modal"
import { CreditUpgradeModal } from "@/components/credit-upgrade-modal"
import { CreditBalance } from "@/components/credit-balance"

interface Tweet {
  content: string
  timestamp: string
  platform: string
}

// Post type options with icons and descriptions
const POST_TYPES = [
  { value: "hot-take", label: "🔥 Hot Take", description: "Controversial opinions that spark debate" },
  { value: "cringe-flex", label: "🥵 Cringe Flex", description: "Humble-bragging about achievements" },
  { value: "tech-advice", label: "🤓 Tech Advice", description: "Opinionated tech and career tips" },
  { value: "vc-bait", label: "💰 VC Bait", description: "Startups pitching for funding" },
  { value: "edgy-roast", label: "🧂 Edgy Roast", description: "Sarcastic takes on tech culture" },
  { value: "self-pity", label: "😭 Self-Pity", description: "Struggles of a tech worker" },
  { value: "desi-dev-joke", label: "🇮🇳 Desi Dev Joke", description: "Jokes about Indian tech culture" }
];

export default function Dashboard() {
  // State management
  const [postType, setPostType] = useState<string>("hot-take")
  const [toxicityLevel, setToxicityLevel] = useState<number>(5)
  const [topic, setTopic] = useState<string>("")
  const [tones, setTones] = useState({
    sarcastic: false,
    inspirational: false,
    cringe: false,
    angry: false,
    startupy: false,
  })
  const [generatedTweet, setGeneratedTweet] = useState<Tweet | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentGenerations, setRecentGenerations] = useState<Tweet[]>([])
  const [activeTab, setActiveTab] = useState("generator")
  
  // Free credit system state
  const [isNewUser, setIsNewUser] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [apiKeyWorking, setApiKeyWorking] = useState<boolean | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const { userStats, canGenerate, decrementCredits, isPremium, creditBalance } = useUserStats()

  // Load recent generations
  useEffect(() => {
    if (user) {
      fetchRecentGenerations();
    }
  }, [user]);

  // Test if the Gemini API key is working
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const isWorking = await testGeminiApiKey();
        setApiKeyWorking(isWorking);
        
        if (!isWorking) {
          toast({
            title: "API Connection Issue",
            description: "We're having trouble connecting to our AI. You can still generate posts, but they will use pre-made templates.",
          });
        }
      } catch (error) {
        console.error("Error testing API key:", error);
        setApiKeyWorking(false);
      }
    };
    
    checkApiKey();
  }, [toast]);

  useEffect(() => {
    if (user && userStats) {
      const isNew = userStats.generation_count === 0;
      
      const hasSeenWelcomeMessage = localStorage.getItem('hasSeenWelcome');
      
      setIsNewUser(isNew && !hasSeenWelcomeMessage);
    }
  }, [user, userStats]);

  const fetchRecentGenerations = async () => {
    if (!user) return;
    
    try {
      // First check if the user_generations table exists
      const { data, error } = await supabase
        .from('user_generations')
        .select('content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      // Handle empty result without throwing an error
      if (error) {
        console.error('Supabase error:', error);
        setRecentGenerations([]);
        if (activeTab === "history") {
          setError('Failed to load recent posts. Please try again later.');
        }
        return;
      }
      
      if (data && data.length > 0) {
        const tweets = data.map(item => ({
          content: item.content,
          timestamp: new Date(item.created_at).toLocaleString(),
          platform: "X for iPhone"
        }));
        setRecentGenerations(tweets);
      } else {
        // No data found - set empty array
        setRecentGenerations([]);
      }
    } catch (err) {
      console.error('Error fetching recent generations:', err);
      // Initialize an empty array to prevent UI errors when displaying recent generations
      setRecentGenerations([]);
      // Only set error state if we're on the history tab to avoid confusing the user
      if (activeTab === "history") {
        setError('Failed to load recent posts. Please try again later.');
      }
    }
  };

  // Modal handlers
  const handleWelcomeClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleUpgradeModalClose = () => {
    setShowUpgradeModal(false);
  };

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Handle tone selection
  const handleToneChange = (tone: keyof typeof tones) => {
    setTones(prev => ({
      ...prev,
      [tone]: !prev[tone]
    }))
  }

  // Handle copying content
  const handleCopyTweet = () => {
    if (generatedTweet) {
      navigator.clipboard.writeText(generatedTweet.content)
      toast({
        description: "Copied to clipboard!",
        duration: 2000,
      })
    }
  }

  // Get selected tones as array
  const getSelectedTones = (): string[] => {
    return Object.entries(tones)
      .filter(([_, isSelected]) => isSelected)
      .map(([tone]) => tone);
  }

  // Get human-readable post type label
  const getPostTypeLabel = (type: string): string => {
    const postType = POST_TYPES.find(pt => pt.value === type);
    return postType ? postType.label.replace(/^[\S\s]+ /, '') : type;
  }

  // Save generation to history
  const saveGenerationToHistory = async (content: string) => {
    if (!user) return;
    
    try {
      await supabase.from('user_generations').insert({
        user_id: user.id,
        content: content,
        post_type: postType,
        toxicity_level: toxicityLevel,
        topic: topic || null,
        tones: getSelectedTones(),
        created_at: new Date().toISOString()
      });
      
      // Refresh recent generations
      fetchRecentGenerations();
    } catch (err) {
      console.error('Error saving generation:', err);
    }
  };

  // Define a function to convert the dashboard toxicity level to the template format
  const mapToxicityLevelToTemplateFormat = (level: number): 'Low' | 'Medium' | 'High' => {
    if (level <= 3) return 'Low';
    if (level <= 7) return 'Medium';
    return 'High';
  };

  // Define a function to convert post type to category
  const mapPostTypeToCategory = (type: string): string[] => {
    switch(type.toLowerCase()) {
      case 'hot take': return ['Startups'];
      case 'cringe flex': return ['Hustle', 'Bro Culture'];
      case 'tech advice': return ['AI/ML'];
      case 'vc bait': return ['Startups', 'Crypto'];
      case 'edgy roast': return ['Bro Culture'];
      case 'self-pity': return ['Hustle'];
      case 'desi dev joke': return ['IIT/IIM'];
      default: return ['Startups', 'Hustle'];
    }
  };

  // Generate a post using the local template system
  const generateLocalPost = (postType: string, toxicityNum: number) => {
    const toxicityLevel = mapToxicityLevelToTemplateFormat(toxicityNum);
    const categories = mapPostTypeToCategory(postType);
    
    const { post, author } = generateBrainrotPost(
      toxicityLevel, 
      categories as any
    );
    
    const newTweet = {
      content: post,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      platform: "X for iPhone"
    };
    
    setGeneratedTweet(newTweet);
    
    // Save to history
    saveGenerationToHistory(post);
    
    return post;
  };

  // Generate content with Gemini
  const handleGenerateTweet = async () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate posts",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    // Check if user can generate more posts
    if (!canGenerate()) {
      toast({
        title: "No credits available",
        description: "You need credits to generate posts. Upgrade to get more credits.",
      })
      // Show the upgrade modal instead of redirecting
      setShowUpgradeModal(true)
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      console.log("Starting post generation process...")
      
      // Decrement credits for the user
      const success = await decrementCredits()
      if (!success) {
        throw new Error('Failed to update credits')
      }
      
      console.log("Credits decremented successfully")
      
      // If this was the last credit, show a toast notification
      if (creditBalance <= 1) {
        toast({
          title: "Last credit used",
          description: "You've used your last credit. Upgrade for more credits!",
        })
      }
      
      // Use the local generator instead of API to ensure reliability
      console.log("Using local post generator for reliable generation");
      generateLocalPost(getPostTypeLabel(postType), toxicityLevel);
      
    } catch (error) {
      console.error("Error generating tweet:", error)
      setError(error instanceof Error ? error.message : "Failed to generate content. Please try again.")
      
      // Even if there's an error with credits, try to generate content as a last resort
      try {
        generateLocalPost(getPostTypeLabel(postType), toxicityLevel);
      } catch (fallbackError) {
        console.error("Fallback generation also failed:", fallbackError);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Upgrade to premium
  const handleUpgrade = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upgrade to premium",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    router.push('/pricing')
  }

  // Fallback content generation
  const handleFallbackGeneration = () => {
    // Fallback to mock content if Gemini API fails
    const getTweetContent = () => {
      switch(postType) {
        case "hot-take":
          return "Hot Take: Nobody is telling you this but 99% of devs at FAANG are using LLMs to do their job while collecting 50 LPA. The real 10x engineers are using Claude + Cursor to multiply their output 🤯";
        case "cringe-flex":
          return "Just shipped a side project in 4 hours that would have taken my team at MegaCorp™ 3 sprints to deliver. Using Typescript + Next.js + Supabase while they're still on jQuery 🙃 #buildinpublic";
        case "tech-advice":
          return "Stop wasting time learning frameworks that'll be irrelevant in 6 months. Focus on fundamentals. \n\nAlso me: *rewrites entire codebase with the framework that launched yesterday* 🤡";
        case "vc-bait":
          return "We're democratizing access to AI-powered shitposting for the next billion Indian tech users. Our TAM is 500M+ people and we're growing 42% week-over-week. DMs open for our seed round 💰💰💰";
        case "edgy-roast":
          return "Indian tech \"influencers\" be like: \"I made $50K MRR by teaching DevOps to juniors\" My brother in Christ you're selling a Rs.499 course that's just ChatGPT prompts copied from Reddit 😭";
        case "self-pity":
          return "3 YOE, rejected by 27 companies in a row. Getting destroyed in DSA rounds despite grinding LeetCode for 6 months. Maybe I should just become a product manager 😩";
        case "desi-dev-joke":
          return "When your manager says \"let's take this offline\" but you're already working remotely from your village in Rajasthan where the electricity comes once every 3 hours 🇮🇳⚡";
        default:
          return "Just achieved 10x developer status by connecting ChatGPT to Cursor. Indian tech Twitter can't handle this one weird trick! 🧠💯";
      }
    };
    
    const newTweet = {
      content: getTweetContent(),
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      platform: "X for iPhone"
    };
    
    setGeneratedTweet(newTweet);
    saveGenerationToHistory(newTweet.content);
  }

  // Helper function to handle the generate button click
  const handleGenerateClick = () => {
    if (creditBalance <= 0) {
      toast({
        title: "No credits available",
        description: "You need credits to generate posts. Upgrade to get more credits.",
      })
      setShowUpgradeModal(true)
      return
    }
    
    handleGenerateTweet()
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header (Top Navigation Bar) */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-xl font-bold flex items-center">
                🧠 cursor4shitposting
              </Link>
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/dashboard" className="font-medium text-primary">
                  Dashboard
                </Link>
                <Link href="/history" className="font-medium text-muted-foreground hover:text-primary transition-colors">
                  History
                </Link>
                <Link href="/pricing" className="font-medium text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link href="/settings" className="font-medium text-muted-foreground hover:text-primary transition-colors">
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              {isPremium && (
                <span className="bg-gradient-to-r from-amber-500 to-amber-300 text-black text-xs px-2 py-1 rounded-full font-semibold flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </span>
              )}
              <CreditBalance />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full" size="icon">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>{user?.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center cursor-pointer" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center">
              {error}
              <Button 
                variant="link" 
                className="p-0 h-auto text-destructive ml-4"
                onClick={handleFallbackGeneration}
              >
                Use sample content instead
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* API Key Warning Message */}
        {apiKeyWorking === false && (
          <Alert className="mb-6 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
            <Info className="h-4 w-4 text-orange-500" />
            <AlertTitle className="text-orange-500">Limited functionality</AlertTitle>
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              We're having trouble connecting to our AI service. Posts will be generated using pre-made templates until this is resolved.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="generator" value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setError(null); // Clear errors when switching tabs
        }} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generator" className="flex items-center justify-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center justify-center">
              <HistoryIcon className="h-4 w-4 mr-2" />
              Recent Posts
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Post Generator Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Shitpost Generator</CardTitle>
                      {!isPremium && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
                            {creditBalance > 0 ? (
                              <>
                                <span className="text-amber-500 font-bold">{creditBalance}/2</span> 
                                <span>credits</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5 text-destructive" />
                                <span className="text-destructive">Credits used</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <CardDescription>Create your viral Indian tech Twitter post</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Post Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Post Type</label>
                      <Select value={postType} onValueChange={setPostType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select post type" />
                        </SelectTrigger>
                        <SelectContent>
                          {POST_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex flex-col">
                                <span>{type.label}</span>
                                <span className="text-xs text-muted-foreground">{type.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Toxicity Level */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Toxicity Level: {toxicityLevel}</label>
                        <div className="text-xs text-muted-foreground">
                          {toxicityLevel <= 3 ? "Friendly 🤝" : 
                           toxicityLevel <= 7 ? "Mid brainrot 🧠" : 
                           "Unfiltered hell 🧨"}
                        </div>
                      </div>
                      <Slider
                        value={[toxicityLevel]}
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={(value) => setToxicityLevel(value[0])}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mild</span>
                        <span>Spicy</span>
                        <span>Toxic</span>
                      </div>
                    </div>

                    {/* Post Info (Credits / Topic Selection) */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <h3 className="text-sm font-medium">Topic (Optional)</h3>
                        <Input
                          placeholder="e.g. AI startups, remote work, hustle culture..."
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CreditBalance />
                      </div>
                    </div>

                    {/* Tone Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tone (Optional)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <TooltipProvider>
                          {Object.entries(tones).map(([tone, isChecked]) => (
                            <Tooltip key={tone}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`tone-${tone}`} 
                                    checked={isChecked}
                                    onCheckedChange={() => handleToneChange(tone as keyof typeof tones)}
                                  />
                                  <label 
                                    htmlFor={`tone-${tone}`} 
                                    className="text-sm cursor-pointer capitalize"
                                  >
                                    {tone}
                                  </label>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getToneDescription(tone)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </TooltipProvider>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleGenerateClick}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Post
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Output Section (Post Preview) */}
                {generatedTweet && (
                  <Card className="mt-6 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base">Generated Post</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg p-4 bg-card shadow-sm">
                        <div className="flex items-start space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                            {user?.email?.charAt(0).toUpperCase() || '🧠'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">You</span>
                              <span className="text-muted-foreground">@user{Math.floor(Math.random() * 1000)}</span>
                              <span className="text-xs text-muted-foreground">· {generatedTweet.timestamp}</span>
                            </div>
                            <p className="mt-2 whitespace-pre-line">{generatedTweet.content}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={handleCopyTweet} className="flex items-center">
                                <CopyIcon className="mr-1.5 h-3.5 w-3.5" />
                                Copy
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={creditBalance <= 0 ? handleUpgrade : handleGenerateTweet}
                                disabled={isGenerating}
                                className="flex items-center"
                              >
                                {creditBalance <= 0 ? (
                                  <>
                                    <Crown className="mr-1.5 h-3.5 w-3.5" />
                                    Upgrade
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                    Generate Post
                                  </>
                                )}
                              </Button>
                              <Button variant="outline" size="sm" className="flex items-center">
                                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Feature Card */}
                <Card className="bg-card/50 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Gemini AI Powered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Our cutting-edge AI generates high-quality shitposts tailored to Indian tech Twitter culture.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col items-center p-2 border rounded-md bg-card/50">
                          <Sparkles className="h-5 w-5 text-primary mb-1" />
                          <span className="text-xs font-medium">Smart Generation</span>
                        </div>
                        <div className="flex flex-col items-center p-2 border rounded-md bg-card/50">
                          <Share2 className="h-5 w-5 text-primary mb-1" />
                          <span className="text-xs font-medium">Easy Sharing</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upgrade Card */}
                <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
                  <CardContent className="pt-6">
                    {isPremium ? (
                      <>
                        <h3 className="text-lg font-semibold mb-2">Premium Active</h3>
                        <p className="text-sm text-purple-200 mb-4">You have unlimited shitpost generations and access to all premium features.</p>
                        <div className="bg-white/10 p-3 rounded-md text-center">
                          <span className="text-xs">Premium Status: Active</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">Credit Balance</h3>
                          <div className="bg-white/10 px-3 py-1.5 rounded-full">
                            <span className="text-amber-300 font-bold">{creditBalance}</span>
                            <span className="ml-1 text-sm">credits</span>
                          </div>
                        </div>
                        <p className="text-sm text-purple-200 mb-4">
                          {creditBalance > 0 
                            ? `Each post costs 1 credit. Purchase more to continue creating viral content.` 
                            : `You've run out of credits. Purchase more to continue generating viral content.`}
                        </p>
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          onClick={creditBalance > 0 ? handleGenerateTweet : handleUpgrade}
                          disabled={isGenerating}
                        >
                          {creditBalance > 0 ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Post
                            </>
                          ) : (
                            <>
                              <Crown className="mr-2 h-4 w-4" />
                              Upgrade
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Posts</CardTitle>
                <CardDescription>History of your generated content</CardDescription>
              </CardHeader>
              <CardContent>
                {error && activeTab === "history" ? (
                  <div className="text-center py-8">
                    <p className="text-destructive">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={fetchRecentGenerations}>
                      Retry
                    </Button>
                  </div>
                ) : recentGenerations.length > 0 ? (
                  <div className="space-y-6">
                    {recentGenerations.map((tweet, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4 py-2">
                        <p className="whitespace-pre-line">{tweet.content}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">{tweet.timestamp}</p>
                          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(tweet.content)}>
                            <CopyIcon className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => router.push('/history')}>
                      View Full History
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No posts generated yet</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("generator")}>
                      Create Your First Post
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Fixed Generate Button */}
      {user && activeTab === "history" && (
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={() => {
              setActiveTab("generator");
              router.push('/dashboard');
            }} 
            size="lg" 
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90 px-6"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Create New Post
          </Button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <div className="space-x-4">
              <Link href="#" className="hover:text-primary">Terms</Link>
              <Link href="#" className="hover:text-primary">Privacy</Link>
              <Link href="#" className="hover:text-primary">Feedback</Link>
              <span>Made in 🇮🇳 by indie hackers</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Welcome Modal */}
      <WelcomeModal isNewUser={isNewUser} freeCredits={2} onClose={handleWelcomeClose} />
      
      {/* Upgrade Modal */}
      <CreditUpgradeModal isOpen={showUpgradeModal} onClose={handleUpgradeModalClose} />
    </div>
  )
}

// Helper function for tone descriptions
function getToneDescription(tone: string): string {
  switch(tone) {
    case 'sarcastic': return "Add sarcastic wit and irony to your post";
    case 'inspirational': return "Add motivational, uplifting elements";
    case 'cringe': return "Deliberately over-the-top or awkward";
    case 'angry': return "Add frustration and intensity";
    case 'startupy': return "Use startup and tech buzzwords";
    default: return "Adjust the tone of your generated post";
  }
} 