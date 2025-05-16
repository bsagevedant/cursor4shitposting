import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { useUserStats } from '@/hooks/use-user-stats';
import { Check, Crown, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Script from 'next/script';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import Image from 'next/image';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PremiumUpgrade() {
  const { user } = useUser();
  const { isPremium, creditBalance, addCredits } = useUserStats();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'startup' | 'slayer'>('startup');
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const plans = {
    basic: {
      name: 'Post Starter',
      price: '$12',
      rawPrice: 12,
      credits: 50,
      features: [
        '50 post credits',
        'Save generated posts',
        'Access to all post types',
        'Standard support'
      ],
      idealFor: 'Casual users, beginners'
    },
    startup: {
      name: 'Content Creator',
      price: '$39',
      rawPrice: 39,
      credits: 175,
      features: [
        '175 post credits',
        'Save generated posts',
        'Access to all post types',
        'Custom templates',
        'Priority support'
      ],
      idealFor: 'Regular content creators, professionals'
    },
    slayer: {
      name: 'Power User',
      price: '$69',
      rawPrice: 69,
      credits: 350,
      features: [
        '350 post credits',
        'Save generated posts',
        'Access to all post types',
        'Custom templates',
        'Priority support',
        'Advanced analytics',
        'White-label exports'
      ],
      idealFor: 'Agencies, power users, teams'
    }
  };

  const selectPlan = (plan: 'basic' | 'startup' | 'slayer') => {
    setSelectedPlan(plan);
    setPaymentDialogOpen(true);
  };

  const initiateRazorpayPayment = async () => {
    if (!user) {
      toast.error('Please sign in to purchase credits');
      return;
    }

    setIsLoading(true);

    try {
      // Create order
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'cursor4shitposting',
        description: `${plans[selectedPlan].name} - ${plans[selectedPlan].credits} Credits`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                credits: plans[selectedPlan].credits
              }),
            });

            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            // Close payment dialog
            setPaymentDialogOpen(false);

            // Add credits to user account
            await addCredits(plans[selectedPlan].credits);

            toast.success(`Payment successful! ${plans[selectedPlan].credits} credits have been added to your account.`);
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        },
        theme: {
          color: '#6366F1',
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePaypalPayment = async () => {
    if (!user) {
      toast.error('Please sign in to purchase credits');
      return;
    }

    setIsLoading(true);

    try {
      // Create PayPal order
      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plan: selectedPlan,
          credits: plans[selectedPlan].credits 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      // Redirect to PayPal approval URL
      window.location.href = data.approvalUrl;
    } catch (error) {
      console.error('PayPal error:', error);
      toast.error('Failed to initiate PayPal payment. Please try again later.');
      setIsLoading(false);
    }
  };

  // Check if the payment was successful on page load (after PayPal redirect)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const payment = queryParams.get('payment');
    const credits = queryParams.get('credits');
    
    if (payment === 'success' && credits) {
      const creditAmount = parseInt(credits, 10);
      if (!isNaN(creditAmount)) {
        addCredits(creditAmount);
        toast.success(`Payment successful! ${creditAmount} credits have been added to your account.`);
      }
      // Clear the URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const error = queryParams.get('error');
    if (error) {
      toast.error('Payment failed. Please try again or contact support.');
      // Clear the URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Credit Packages</h2>
          <p className="text-muted-foreground">
            {`You currently have ${creditBalance} credits in your account.`}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Basic Plan */}
          <Card className={selectedPlan === 'basic' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>{plans.basic.name}</CardTitle>
              <CardDescription>For casual users</CardDescription>
              <div className="mt-2">
                <Badge variant="secondary">Starter</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{plans.basic.price}</div>
              <div className="text-xl font-semibold text-primary mb-2">{plans.basic.credits} Credits</div>
              <div className="text-sm text-muted-foreground mb-4">Ideal for: {plans.basic.idealFor}</div>
              <ul className="space-y-2">
                {plans.basic.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => selectPlan('basic')}
                disabled={isLoading}
              >
                {isLoading && selectedPlan === 'basic' ? 'Processing...' : 'Buy Credits'}
              </Button>
            </CardFooter>
          </Card>

          {/* Startup Plan */}
          <Card className={selectedPlan === 'startup' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>{plans.startup.name}</CardTitle>
              <CardDescription>For content creators</CardDescription>
              <div className="mt-2">
                <Badge variant="secondary">Best Value</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{plans.startup.price}</div>
              <div className="text-xl font-semibold text-primary mb-2">{plans.startup.credits} Credits</div>
              <div className="text-sm text-muted-foreground mb-4">Ideal for: {plans.startup.idealFor}</div>
              <ul className="space-y-2">
                {plans.startup.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => selectPlan('startup')}
                disabled={isLoading}
              >
                <Crown className="mr-2 h-4 w-4" />
                {isLoading && selectedPlan === 'startup' ? 'Processing...' : 'Buy Credits'}
              </Button>
            </CardFooter>
          </Card>

          {/* Slayer Plan */}
          <Card className={selectedPlan === 'slayer' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>{plans.slayer.name}</CardTitle>
              <CardDescription>For power users</CardDescription>
              <div className="mt-2">
                <Badge>Premium</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{plans.slayer.price}</div>
              <div className="text-xl font-semibold text-primary mb-2">{plans.slayer.credits} Credits</div>
              <div className="text-sm text-muted-foreground mb-4">Ideal for: {plans.slayer.idealFor}</div>
              <ul className="space-y-2">
                {plans.slayer.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => selectPlan('slayer')}
                disabled={isLoading}
              >
                <Crown className="mr-2 h-4 w-4" />
                {isLoading && selectedPlan === 'slayer' ? 'Processing...' : 'Buy Credits'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          All packages include a 7-day money-back guarantee. No questions asked.
        </div>

        {/* Payment Method Selection Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose a Payment Method</DialogTitle>
              <DialogDescription>
                Select your preferred payment method for {plans[selectedPlan].credits} credits ({plans[selectedPlan].price}).
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <Button 
                onClick={initiateRazorpayPayment} 
                className="flex items-center justify-between"
                disabled={isLoading || !razorpayLoaded}
              >
                <span className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay with Razorpay
                </span>
                <Image 
                  src="/razorpay-logo.png" 
                  alt="Razorpay" 
                  width={80} 
                  height={24}
                  className="ml-2"
                />
              </Button>
              
              <Button 
                onClick={initiatePaypalPayment} 
                variant="outline" 
                className="flex items-center justify-between"
                disabled={isLoading}
              >
                <span>Pay with PayPal</span>
                <Image 
                  src="/paypal-logo.png" 
                  alt="PayPal" 
                  width={80} 
                  height={24} 
                  className="ml-2"
                />
              </Button>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
} 