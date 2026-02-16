import type { GenerationData, UserStats } from "@/types/generation";

const STORAGE_KEYS = {
  GENERATIONS: "aivenger_generations",
  USER_STATS: "aivenger_user_stats",
} as const;

/**
 * Get all generations from localStorage
 */
export function getGenerations(): GenerationData[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GENERATIONS);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((gen: GenerationData) => ({
      ...gen,
      createdAt: new Date(gen.createdAt),
    }));
  } catch (error) {
    console.error("Error reading generations from localStorage:", error);
    return [];
  }
}

/**
 * Add a new generation to localStorage
 */
export function addGeneration(data: Omit<GenerationData, "id">): GenerationData {
  const newGeneration: GenerationData = {
    ...data,
    id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date(),
  };

  try {
    const existing = getGenerations();
    const updated = [newGeneration, ...existing]; // Newest first
    localStorage.setItem(STORAGE_KEYS.GENERATIONS, JSON.stringify(updated));

    // Update stats
    updateStats();

    return newGeneration;
  } catch (error) {
    console.error("Error saving generation to localStorage:", error);
    throw error;
  }
}

/**
 * Delete a generation by ID
 */
export function deleteGeneration(id: string): void {
  try {
    const existing = getGenerations();
    const filtered = existing.filter((gen) => gen.id !== id);
    localStorage.setItem(STORAGE_KEYS.GENERATIONS, JSON.stringify(filtered));

    // Update stats
    updateStats();
  } catch (error) {
    console.error("Error deleting generation from localStorage:", error);
    throw error;
  }
}

/**
 * Get user statistics
 */
export function getStats(): UserStats {
  if (typeof window === "undefined") {
    return { totalGenerations: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (!stored) {
      return { totalGenerations: 0 };
    }

    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      lastGenerationDate: parsed.lastGenerationDate
        ? new Date(parsed.lastGenerationDate)
        : undefined,
    };
  } catch (error) {
    console.error("Error reading stats from localStorage:", error);
    return { totalGenerations: 0 };
  }
}

/**
 * Update statistics based on current generations
 */
function updateStats(): void {
  try {
    const generations = getGenerations();
    const completedGenerations = generations.filter(
      (gen) => gen.status === "completed"
    );

    const lastDate =
      completedGenerations.length > 0
        ? completedGenerations[0]?.createdAt
        : undefined;

    const stats: UserStats = {
      totalGenerations: completedGenerations.length,
      ...(lastDate && { lastGenerationDate: lastDate }),
    };

    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}

/**
 * Clear all generation data (useful for testing)
 */
export function clearAllGenerations(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GENERATIONS);
    localStorage.removeItem(STORAGE_KEYS.USER_STATS);
  } catch (error) {
    console.error("Error clearing generations:", error);
  }
}
