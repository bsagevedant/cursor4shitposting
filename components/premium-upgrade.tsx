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
  const { isPremium, freeGenerationsUsed, freeGenerationsLeft, setPremiumStatus } = useUserStats();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'startup' | 'slayer'>('startup');
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const plans = {
    basic: {
      name: 'Desi Basic',
      price: '$12',
      rawPrice: 12,
      features: [
        'Limited post generations (100/month)',
        'Access to basic modes',
        'Standard support'
      ],
      validity: 30,
      idealFor: 'Students, early-stage meme lords'
    },
    startup: {
      name: 'Startup Beast',
      price: '$39',
      rawPrice: 39,
      features: [
        'Unlimited post generations',
        'Access to all special modes',
        'Custom templates',
        'Priority support'
      ],
      validity: 30,
      idealFor: 'Founders, shitposting SaaS bros'
    },
    slayer: {
      name: 'VC Slayer',
      price: '$69',
      rawPrice: 69,
      features: [
        'Unlimited post generations',
        'Access to all special modes',
        'Custom templates',
        'VIP support',
        'Advanced analytics',
        'White-label exports'
      ],
      validity: 30,
      idealFor: 'Meme kings, ghostwriters, agencies'
    }
  };

  const selectPlan = (plan: 'basic' | 'startup' | 'slayer') => {
    setSelectedPlan(plan);
    setPaymentDialogOpen(true);
  };

  const initiateRazorpayPayment = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade to premium');
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
        description: `${plans[selectedPlan].name} Subscription`,
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
                validity: plans[selectedPlan].validity
              }),
            });

            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            // Close payment dialog
            setPaymentDialogOpen(false);

            // Update premium status
            const expiryDate = new Date(verifyData.expiryDate);
            await setPremiumStatus(expiryDate);

            toast.success('Payment successful! You are now premium until ' + expiryDate.toLocaleDateString());
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
      toast.error('Please sign in to upgrade to premium');
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
        body: JSON.stringify({ plan: selectedPlan }),
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
    const expiry = queryParams.get('expiry');
    
    if (payment === 'success' && expiry) {
      toast.success('Payment successful! You are now premium until ' + new Date(expiry).toLocaleDateString());
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
          <h2 className="text-2xl font-bold">Premium Plans</h2>
          <p className="text-muted-foreground">
            {isPremium 
              ? 'You are currently on a premium plan.' 
              : `You have used ${freeGenerationsUsed}/2 free generations.`}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Desi Basic Plan */}
          <Card className={selectedPlan === 'basic' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>Desi Basic</CardTitle>
              <CardDescription>For meme beginners</CardDescription>
              <div className="mt-2">
                <Badge variant="secondary">Starter</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{plans.basic.price} <span className="text-sm font-normal text-muted-foreground">/month</span></div>
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
                {isLoading && selectedPlan === 'basic' ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>

          {/* Startup Beast Plan */}
          <Card className={selectedPlan === 'startup' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>Startup Beast</CardTitle>
              <CardDescription>For serious shitposters</CardDescription>
              <div className="mt-2">
                <Badge variant="secondary">Most Popular</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{plans.startup.price} <span className="text-sm font-normal text-muted-foreground">/month</span></div>
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
                {isLoading && selectedPlan === 'startup' ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>

          {/* VC Slayer Plan */}
          <Card className={selectedPlan === 'slayer' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>VC Slayer</CardTitle>
              <CardDescription>For meme professionals</CardDescription>
              <div className="mt-2">
                <Badge>Premium</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{plans.slayer.price} <span className="text-sm font-normal text-muted-foreground">/month</span></div>
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
                {isLoading && selectedPlan === 'slayer' ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          All plans include a 7-day money-back guarantee. No questions asked.
        </div>

        {/* Payment Method Selection Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose a Payment Method</DialogTitle>
              <DialogDescription>
                Select your preferred payment method for the {plans[selectedPlan].name} plan ({plans[selectedPlan].price}/month).
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