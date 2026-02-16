import { Shield, Zap, Users } from "lucide-react";
import { PricingTierCard } from "@/components/pricing-tier-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PricingTier } from "@/types/generation";

const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    features: [
      "5 superhero transformations per month",
      "Basic AI processing",
      "Standard quality downloads",
      "Gallery storage (local)",
      "Community support",
    ],
    highlighted: false,
    comingSoon: false,
    ctaLabel: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    interval: "month",
    features: [
      "Unlimited superhero transformations",
      "Advanced AI processing",
      "High-quality downloads (4K)",
      "Cloud gallery storage",
      "Priority generation queue",
      "Custom style presets",
      "Priority email support",
      "Remove watermarks",
    ],
    highlighted: true,
    comingSoon: true,
    ctaLabel: "Coming Soon",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    features: [
      "Everything in Pro",
      "API access",
      "Bulk processing",
      "Custom AI model training",
      "White-label solution",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
    ],
    highlighted: false,
    comingSoon: true,
    ctaLabel: "Contact Sales",
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Hero Plan
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start for free and upgrade when you're ready for more transformations
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_TIERS.map((tier) => (
            <PricingTierCard key={tier.id} tier={tier} />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Secure & Private</p>
              <p className="text-sm text-muted-foreground">
                Your data is encrypted
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">No Credit Card Required</p>
              <p className="text-sm text-muted-foreground">
                Start free today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Join 1000+ Heroes</p>
              <p className="text-sm text-muted-foreground">
                Trusted by creators
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t pt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pricing FAQs
          </h2>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="change">
                <AccordionTrigger>Can I change plans later?</AccordionTrigger>
                <AccordionContent>
                  Yes! You can upgrade or downgrade your plan at any time. Changes
                  will be reflected in your next billing cycle.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cancel">
                <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. There are no long-term contracts. You can cancel
                  your subscription at any time, and you'll continue to have
                  access until the end of your billing period.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refund">
                <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
                <AccordionContent>
                  We offer a 14-day money-back guarantee for all paid plans. If
                  you're not satisfied, contact us within 14 days of your purchase
                  for a full refund.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment">
                <AccordionTrigger>
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards (Visa, MasterCard, American
                  Express), PayPal, and wire transfers for Enterprise plans.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="free-forever">
                <AccordionTrigger>
                  Is the free plan really free forever?
                </AccordionTrigger>
                <AccordionContent>
                  Yes! Our free plan will always be available with basic features.
                  It's perfect for casual users who want to create a few superhero
                  avatars each month.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="enterprise">
                <AccordionTrigger>
                  How does Enterprise pricing work?
                </AccordionTrigger>
                <AccordionContent>
                  Enterprise pricing is customized based on your specific needs,
                  including the number of users, API usage, and additional
                  features. Contact our sales team for a personalized quote.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t mt-16 pt-16">
          <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Unleash Your Inner Hero?
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start creating amazing superhero avatars today. No credit card
              required to get started!
            </p>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium text-lg"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
