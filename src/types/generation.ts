export interface GenerationData {
  id: string;
  userId: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  createdAt: Date;
  status: "pending" | "completed" | "failed";
}

export interface PricingTier {
  id: string;
  name: string;
  price: number | "Free" | "Custom";
  interval?: "month" | "year";
  features: string[];
  highlighted?: boolean;
  comingSoon?: boolean;
  ctaLabel: string;
}

export interface UserStats {
  totalGenerations: number;
  lastGenerationDate?: Date;
}
