import { Sparkles } from "lucide-react"
import { useUserStats } from "@/hooks/use-user-stats"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface CreditBalanceProps {
  showBuyButton?: boolean;
}

export function CreditBalance({ showBuyButton = true }: CreditBalanceProps) {
  const { creditBalance } = useUserStats()
  const router = useRouter()
  
  const handleBuyCredits = () => {
    router.push('/pricing')
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium">
          <span className="text-amber-500 font-bold">{creditBalance}</span> credits
        </span>
      </div>
      
      {showBuyButton && (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={handleBuyCredits}
        >
          Buy Credits
        </Button>
      )}
    </div>
  )
} 