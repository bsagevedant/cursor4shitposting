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
import { Crown, Gift, Sparkles } from "lucide-react"

interface WelcomeModalProps {
  isNewUser: boolean;
  freeCredits: number;
  onClose: () => void;
}

export function WelcomeModal({ isNewUser, freeCredits, onClose }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show modal only for new users
    if (isNewUser) {
      setIsOpen(true)
    }
  }, [isNewUser])

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gift className="h-5 w-5 text-amber-500" />
            Welcome to cursor4shitposting!
          </DialogTitle>
          <DialogDescription>
            Generate viral-worthy tech tweets with AI
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-center text-xl font-semibold">
              You have {freeCredits} free generations
            </h3>
            <p className="text-center text-sm text-muted-foreground">
              We've given you {freeCredits} free post generations to get started.
              Generate your first viral tech shitpost in seconds!
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <h4 className="mb-2 font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              Upgrade anytime for unlimited posts
            </h4>
            <p className="text-sm text-muted-foreground">
              After using your free credits, you can upgrade to Premium 
              for unlimited generations and advanced features.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full" size="lg">
            Start Creating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 