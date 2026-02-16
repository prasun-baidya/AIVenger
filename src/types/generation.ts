export interface GenerationData {
  id: string;
  userId: string;
  originalImageUrl: string;
  generatedImageUrl: string | null;
  creditsUsed: number;
  status: "pending" | "completed" | "failed";
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  credits: number;
}

// Server action return types (discriminated union for type safety)
export interface GenerateAvatarSuccess {
  success: true;
  generation: GenerationData;
  remainingCredits: number;
}

export interface GenerateAvatarError {
  success: false;
  error: string;
  code:
    | "INSUFFICIENT_CREDITS"
    | "UPLOAD_FAILED"
    | "AI_GENERATION_FAILED"
    | "DATABASE_ERROR"
    | "UNAUTHORIZED";
}

export type GenerateAvatarResult = GenerateAvatarSuccess | GenerateAvatarError;
