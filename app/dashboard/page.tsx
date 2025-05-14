'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface User {
  id: string
  email: string
  subscription_status: string
}

interface Tweet {
  content: string
  timestamp: string
  platform: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [toxicityLevel, setToxicityLevel] = useState(50)
  const [selectedCategories, setSelectedCategories] = useState({
    startups: false,
    iitIim: false,
    aiMl: false,
    crypto: false,
    hustle: false,
    broCulture: false
  })
  const [generatedTweet, setGeneratedTweet] = useState<Tweet | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }

        if (!session) {
          console.log('No active session found, redirecting to login')
          router.push('/login')
          return
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError) {
          console.error('Database error:', {
            message: userError.message,
            code: userError.code,
            details: userError.details,
            hint: userError.hint
          })
          throw userError
        }

        if (!userData) {
          console.error('No user data found for ID:', session.user.id)
          throw new Error('User data not found')
        }

        setUser(userData)
      } catch (error) {
        console.error('Error loading user:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
          stack: error instanceof Error ? error.stack : undefined
        })
        // Optionally show an error state to the user
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleGenerate = () => {
    // Mock generated tweet for now
    setGeneratedTweet({
      content: "GATE toppers grads on LinkedIn be like: 'Rejected Google and Microsoft to join this pre-seed bootstrapped SaaS because productivity app junkies' 👀👀",
      timestamp: "12:34 PM",
      platform: "Twitter for iPhone"
    })
  }

  const handleSpecialMode = (mode: string) => {
    // Implementation for special modes
    console.log(`Generating ${mode}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">cursor4shitposting</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/history')}>History</Button>
              <Button variant="outline" onClick={() => router.push('/settings')}>Settings</Button>
              <Button variant="default" onClick={handleSignOut}>Sign Out</Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Generator Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Generate</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-foreground">Toxicity Level</h3>
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setToxicityLevel(value[0])}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">Edgy, mildly offensive</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-foreground">Content Categories</h3>
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

              <Button className="w-full" size="lg" onClick={handleGenerate}>
                Generate New Post
              </Button>
            </div>

            {generatedTweet && (
              <Card className="mt-6 p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-foreground">Rahul Founder</span>
                      <span className="text-muted-foreground">@RahulFounderAI</span>
                    </div>
                    <p className="mt-2 text-foreground">{generatedTweet.content}</p>
                    <div className="mt-2 text-muted-foreground text-sm flex items-center space-x-2">
                      <span>{generatedTweet.timestamp}</span>
                      <span>•</span>
                      <span>{generatedTweet.platform}</span>
                    </div>
                    <div className="mt-4 flex space-x-4">
                      <Button variant="outline" size="sm">Copy Post</Button>
                      <Button variant="outline" size="sm">Share on X</Button>
                      <Button variant="outline" size="sm">Save & Track</Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </Card>

          {/* Special Modes Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Special Modes</h2>
            <p className="text-gray-600 mb-6">Generate specialized content for maximum engagement</p>
            
            <div className="space-y-4">
              <Button
                className="w-full justify-start text-left h-auto py-4"
                variant="outline"
                onClick={() => handleSpecialMode('founders-meltdown')}
              >
                <div>
                  <h3 className="font-bold">Founder's Meltdown</h3>
                  <p className="text-sm text-gray-500">Generate a dramatic founder meltdown post that's both hilarious and relatable</p>
                </div>
              </Button>

              <Button
                className="w-full justify-start text-left h-auto py-4"
                variant="outline"
                onClick={() => handleSpecialMode('fake-vc-takes')}
              >
                <div>
                  <h3 className="font-bold">Fake VC Takes</h3>
                  <p className="text-sm text-gray-500">Generate satirical VC hot takes that parody the Indian startup ecosystem</p>
                </div>
              </Button>

              <Button
                className="w-full justify-start text-left h-auto py-4"
                variant="outline"
                onClick={() => handleSpecialMode('iit-bait')}
              >
                <div>
                  <h3 className="font-bold">IIT Bait Thread</h3>
                  <p className="text-sm text-gray-500">Generate controversial IIT-related threads that are guaranteed to trigger engagement</p>
                </div>
              </Button>
            </div>

            {/* Example Special Mode Tweet */}
            <Card className="mt-6 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-foreground">Rahul Founder</span>
                    <span className="text-muted-foreground">@RahulFounderAI</span>
                  </div>
                  <p className="mt-2 text-foreground">Just got rejected by YC for the 3rd time. My parents are celebrating. My friends are celebrating. My bank account is crying. But my delusion is stronger than ever! 🚀</p>
                  <div className="mt-2 text-muted-foreground text-sm flex items-center space-x-2">
                    <span>12:34 PM</span>
                    <span>•</span>
                    <span>Twitter for iPhone</span>
                  </div>
                </div>
              </div>
            </Card>
          </Card>
        </div>
      </main>
    </div>
  )
} 