import { Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PricingTier } from "@/types/generation";

interface PricingTierCardProps {
  tier: PricingTier;
}

export function PricingTierCard({ tier }: PricingTierCardProps) {
  return (
    <div
      className={`relative border rounded-lg p-8 flex flex-col h-full ${
        tier.highlighted
          ? "border-primary shadow-xl scale-105"
          : "border-border hover:shadow-lg"
      } transition-all`}
    >
      {/* Most Popular Badge */}
      {tier.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          <Star className="h-3 w-3 mr-1 fill-current" />
          Most Popular
        </Badge>
      )}

      {/* Coming Soon Badge */}
      {tier.comingSoon && (
        <Badge
          variant="outline"
          className="absolute -top-3 left-1/2 -translate-x-1/2"
        >
          Coming Soon
        </Badge>
      )}

      {/* Tier Name */}
      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>

      {/* Price */}
      <div className="mb-6">
        {typeof tier.price === "number" ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">${tier.price}</span>
            {tier.interval && (
              <span className="text-muted-foreground">/{tier.interval}</span>
            )}
          </div>
        ) : (
          <div className="text-4xl font-bold">{tier.price}</div>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-grow">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        variant={tier.highlighted ? "default" : "outline"}
        size="lg"
        className="w-full"
        disabled={tier.comingSoon}
      >
        {tier.ctaLabel}
      </Button>
    </div>
  );
}
