import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            cursor4shitposting
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl">
            Your ultimate platform for creative expression and community engagement
          </p>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors duration-200 font-semibold"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-8 py-3 rounded-full bg-pink-600 hover:bg-pink-700 transition-colors duration-200 font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}