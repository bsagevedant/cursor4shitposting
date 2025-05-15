import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, Lock, Check } from "lucide-react"
import { useRouter } from 'next/navigation'

interface CreditUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditUpgradeModal({ isOpen, onClose }: CreditUpgradeModalProps) {
  const [open, setOpen] = useState(isOpen)
  const router = useRouter()

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const handleUpgrade = () => {
    setOpen(false)
    onClose()
    router.push('/pricing')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-primary" />
            You've used all your free credits
          </DialogTitle>
          <DialogDescription>
            Upgrade to premium to keep generating viral-worthy content
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-purple-600 text-white">
              <Crown className="h-6 w-6" />
            </div>
            <h3 className="text-center text-lg font-semibold">
              Unlock Premium Benefits
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Unlimited Generations</p>
                <p className="text-sm text-muted-foreground">Create as many viral posts as you want</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Advanced Post Types</p>
                <p className="text-sm text-muted-foreground">Access exclusive templates and tones</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Enhanced Analytics</p>
                <p className="text-sm text-muted-foreground">Track performance and improve your content</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="sm:flex-1">
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="sm:flex-1" size="lg">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 