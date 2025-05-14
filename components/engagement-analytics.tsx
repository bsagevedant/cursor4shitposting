'use client'

import { Card } from '@/components/ui/card'
import { BarChart2 } from 'lucide-react'

export function EngagementAnalytics() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Engagement Analytics</h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Coming soon! Track your post performance and engagement metrics.</p>
        </div>
      </div>
    </Card>
  )
} 