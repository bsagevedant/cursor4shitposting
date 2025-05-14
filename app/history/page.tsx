'use client';

import { PostHistory } from '@/components/post-history';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold">Post History</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PostHistory />
      </main>
    </div>
  );
} 