import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            cursor4shitposting
          </h1>
          <p className="text-xl text-muted-foreground">
            Generate random, high-engagement shitposts crafted for Indian Tech Twitter
          </p>
          <Link href="https://x.com/sagevedant" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
            @sagevedant
          </Link>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/login">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}