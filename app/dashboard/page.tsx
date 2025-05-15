'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CopyIcon, RefreshCw, Share2, UserCircle, LogOut, Crown, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generatePost } from '@/lib/gemini'
import { useUser } from "@/hooks/use-user"
import { useUserStats } from "@/hooks/use-user-stats"
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface Tweet {
  content: string
  timestamp: string
  platform: string
}

export default function Dashboard() {
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
  
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const { userStats, canGenerate, incrementGenerationCount, isPremium, freeGenerationsLeft, setPremiumStatus } = useUserStats()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleToneChange = (tone: keyof typeof tones) => {
    setTones(prev => ({
      ...prev,
      [tone]: !prev[tone]
    }))
  }

  const handleCopyTweet = () => {
    if (generatedTweet) {
      navigator.clipboard.writeText(generatedTweet.content)
      toast({
        description: "Copied to clipboard!",
        duration: 2000,
      })
    }
  }

  const getSelectedTones = (): string[] => {
    return Object.entries(tones)
      .filter(([_, isSelected]) => isSelected)
      .map(([tone]) => tone);
  }

  const getPostTypeLabel = (type: string): string => {
    switch(type) {
      case "hot-take": return "Hot Take";
      case "cringe-flex": return "Cringe Flex";
      case "tech-advice": return "Tech Advice";
      case "vc-bait": return "VC Bait";
      case "edgy-roast": return "Edgy Roast";
      case "self-pity": return "Self-Pity";
      case "desi-dev-joke": return "Desi Dev Joke";
      default: return type;
    }
  }

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
        title: "Free limit reached",
        description: "You've used your 2 free generations. Upgrade to continue generating content.",
        variant: "destructive",
      })
      // Redirect to pricing page when free generations are used up
      router.push('/pricing')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      // Increment generation count for non-premium users
      if (!isPremium) {
        const success = await incrementGenerationCount()
        if (!success) {
          throw new Error('Failed to increment generation count')
        }
      }
      
      const content = await generatePost(
        getPostTypeLabel(postType),
        toxicityLevel,
        topic || null,
        getSelectedTones()
      )
      
      setGeneratedTweet({
        content,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        platform: "X for iPhone"
      })
    } catch (error) {
      console.error("Error generating tweet:", error)
      setError(error instanceof Error ? error.message : "Failed to generate content. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Add payment handling
  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upgrade to premium",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    // Redirect to pricing page
    router.push('/pricing')
  }

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
    
    setGeneratedTweet({
      content: getTweetContent(),
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      platform: "X for iPhone"
    });
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header (Top Navigation Bar) */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-xl font-bold flex items-center">
                🧠 brainrot.ai
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
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full" size="icon">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center" onClick={handleSignOut}>
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
            <AlertDescription>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Generator Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Shitpost</CardTitle>
                {!isPremium && (
                  <div className="text-sm text-orange-500 font-medium">
                    {freeGenerationsLeft > 0 
                      ? `${freeGenerationsLeft} of 2 free generations remaining` 
                      : 'You have used all your free generations'}
                  </div>
                )}
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
                      <SelectItem value="hot-take">🔥 Hot Take</SelectItem>
                      <SelectItem value="cringe-flex">🥵 Cringe Flex</SelectItem>
                      <SelectItem value="tech-advice">🤓 Tech Advice</SelectItem>
                      <SelectItem value="vc-bait">💰 VC Bait</SelectItem>
                      <SelectItem value="edgy-roast">🧂 Edgy Roast</SelectItem>
                      <SelectItem value="self-pity">😭 Self-Pity</SelectItem>
                      <SelectItem value="desi-dev-joke">🇮🇳 Desi Dev Joke</SelectItem>
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
                  />
                </div>

                {/* Topic Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic (Optional)</label>
                  <Input 
                    placeholder="e.g. Funding, React vs Svelte, NIT Trichy, Remote work" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                {/* Tone Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tone-sarcastic" 
                        checked={tones.sarcastic}
                        onCheckedChange={() => handleToneChange('sarcastic')}
                      />
                      <label htmlFor="tone-sarcastic" className="text-sm">Sarcastic</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tone-inspirational" 
                        checked={tones.inspirational}
                        onCheckedChange={() => handleToneChange('inspirational')}
                      />
                      <label htmlFor="tone-inspirational" className="text-sm">Inspirational</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tone-cringe" 
                        checked={tones.cringe}
                        onCheckedChange={() => handleToneChange('cringe')}
                      />
                      <label htmlFor="tone-cringe" className="text-sm">Cringe</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tone-angry" 
                        checked={tones.angry}
                        onCheckedChange={() => handleToneChange('angry')}
                      />
                      <label htmlFor="tone-angry" className="text-sm">Angry</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tone-startupy" 
                        checked={tones.startupy}
                        onCheckedChange={() => handleToneChange('startupy')}
                      />
                      <label htmlFor="tone-startupy" className="text-sm">Startup-y</label>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={!isPremium && freeGenerationsLeft === 0 ? handleUpgrade : handleGenerateTweet}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {!isPremium && freeGenerationsLeft === 0 ? 'Redirecting...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      {!isPremium && freeGenerationsLeft === 0 ? (
                        <>
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Generate More
                        </>
                      ) : (
                        <>🧠 Generate Brainrot</>
                      )}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section (Post Preview) */}
            {generatedTweet && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                        🧠
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">Brainrot User</span>
                          <span className="text-muted-foreground">@brainrot_ai</span>
                        </div>
                        <p className="mt-2 whitespace-pre-line">{generatedTweet.content}</p>
                        <div className="mt-2 text-muted-foreground text-sm">
                          {generatedTweet.timestamp} · {generatedTweet.platform}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyTweet}>
                      <CopyIcon className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={!isPremium && freeGenerationsLeft === 0 ? handleUpgrade : handleGenerateTweet}
                    >
                      {!isPremium && freeGenerationsLeft === 0 ? (
                        <>
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Post to X
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recently Generated Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-primary pl-4 py-2">
                  <p className="text-sm">Just deployed my first SaaS in 48 hours. Making $0 MRR but my LinkedIn post got 500 likes so basically I'm killing it 💪</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
                <div className="border-l-2 border-primary pl-4 py-2">
                  <p className="text-sm">Indian LinkedIn influencers writing a post about how they rejected Google to join a "mission-driven" startup that nobody has heard of</p>
                  <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                </div>
                <div className="border-l-2 border-primary pl-4 py-2">
                  <p className="text-sm">POV: You're watching a YouTube tutorial from an Indian dev who explains complex algorithms better than your entire CS degree</p>
                  <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                </div>
                <Button variant="ghost" className="w-full mt-2" size="sm">
                  View History
                </Button>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Most Used Templates</h3>
                    <ol className="space-y-1 list-decimal list-inside text-sm">
                      <li>🔥 Hot Take</li>
                      <li>🧂 Edgy Roast</li>
                      <li>😭 Self-Pity</li>
                    </ol>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Most Toxic Posts</h3>
                    <ol className="space-y-1 list-decimal list-inside text-sm">
                      <li>"Web3 is just..."</li>
                      <li>"India's tech education..."</li>
                      <li>"FAANG engineers who..."</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Card */}
            <Card className="bg-gradient-to-br from-purple-800 to-indigo-900 text-white">
              <CardContent className="pt-6">
                {isPremium ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Premium Active</h3>
                    <p className="text-sm text-purple-200 mb-4">You have unlimited brainrot generations and access to all premium features.</p>
                    <div className="bg-white/10 p-3 rounded-md text-center">
                      <span className="text-xs">Premium Status: Active</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
                    <p className="text-sm text-purple-200 mb-4">Generate unlimited brainrot, access exclusive templates, and post directly to X.</p>
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={handleUpgrade}
                    >
                      Upgrade Now
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

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
    </div>
  )
} 