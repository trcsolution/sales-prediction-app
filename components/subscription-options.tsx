'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

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

export function SubscriptionOptions() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSubscribe = (planName: string) => {
    setSelectedPlan(planName)
    // Here you would typically integrate with a payment provider
    // and handle the subscription process
    alert(`Subscribed to ${planName} plan!`)
  }

  return (
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
  )
}

