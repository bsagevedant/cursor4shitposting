'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function App() {
  const [postContent, setPostContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleGeneratePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    try {
      // TODO: Implement post generation logic here
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPostContent('Generated post content will appear here...')
    } catch (error) {
      console.error('Error generating post:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
                cursor4shitposting
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Generate a Post</h2>
            <form onSubmit={handleGeneratePost} className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                  What kind of post would you like to generate?
                </label>
                <div className="mt-1">
                  <textarea
                    id="prompt"
                    name="prompt"
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter your prompt here..."
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Post'}
                </button>
              </div>
            </form>

            {postContent && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Generated Post</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-gray-700">{postContent}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 