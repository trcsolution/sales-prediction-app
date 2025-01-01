'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, ArrowLeft } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '€0',
    features: ['Basic sales data analysis', 'Up to 100 records', '7-day predictions'],
  },
  {
    name: 'Pro',
    price: '€20',
    interval: 'month',
    features: ['Advanced sales data analysis', 'Unlimited records', '30-day predictions', 'Priority support'],
  },
]

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSubscribe = (planName: string) => {
    setSelectedPlan(planName)
    // Here you would typically integrate with a payment provider
    // and handle the subscription process
    alert(`Subscribed to ${planName} plan!`)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-8">
          Subscription Plans
        </h1>
        <p className="mt-5 max-w-xl text-xl text-gray-500 mb-12">
          Choose a plan that fits your needs and unlock advanced features for your sales analysis.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.name} className={selectedPlan === plan.name ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.interval && <span className="text-sm ml-1">/{plan.interval}</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe(plan.name)}
                  variant={selectedPlan === plan.name ? 'secondary' : 'default'}
                >
                  {selectedPlan === plan.name ? 'Current Plan' : `Subscribe to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

