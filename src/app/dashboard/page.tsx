"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, Image as ImageIcon, Zap, MessageSquare, Coins } from "lucide-react";
import { toast } from "sonner";
import { generateAvatar } from "@/app/actions/generate-avatar";
import { UserProfile } from "@/components/auth/user-profile";
import { EmptyState } from "@/components/empty-state";
import { GenerationLoading } from "@/components/generation-loading";
import { ImageUpload } from "@/components/image-upload";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import type { GenerationData } from "@/types/generation";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentGenerations, setRecentGenerations] = useState<GenerationData[]>(
    []
  );
  const [stats, setStats] = useState({
    totalGenerations: 0,
    credits: 30,
  });

  useEffect(() => {
    if (session) {
      loadRecentGenerations();
      loadStats();
    }
  }, [session]);

  const loadRecentGenerations = async () => {
    try {
      const response = await fetch("/api/generations?status=completed&limit=3");
      if (response.ok) {
        const data = await response.json();
        setRecentGenerations(data.generations);
      }
    } catch (error) {
      console.error("Failed to load recent generations:", error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalGenerations: data.totalGenerations,
          credits: data.credits,
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleGenerate = async () => {
    if (!selectedFile || !session) return;

    // Client-side credit check for UX
    if (stats.credits < 10) {
      toast.error("Insufficient credits", {
        description: "You need 10 credits. Upgrade your plan to continue.",
        action: {
          label: "View Plans",
          onClick: () => (window.location.href = "/pricing"),
        },
      });
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const result = await generateAvatar(formData);

      if (!result.success) {
        if (result.code === "INSUFFICIENT_CREDITS") {
          toast.error("Insufficient Credits", {
            description: result.error,
            action: {
              label: "View Plans",
              onClick: () => (window.location.href = "/pricing"),
            },
          });
        } else {
          toast.error("Generation Failed", { description: result.error });
        }
        return;
      }

      toast.success("Superhero transformation complete!", {
        description: `${result.remainingCredits} credits remaining`,
      });

      setStats((prev) => ({
        ...prev,
        credits: result.remainingCredits,
        totalGenerations: prev.totalGenerations + 1,
      }));

      setSelectedFile(null);
      await loadRecentGenerations();
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Protected Page</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in to access the dashboard
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-muted-foreground">
          Transform yourself into a legendary superhero
        </p>
      </div>

      {/* Upload Section */}
      <div className="max-w-2xl mx-auto">
        <div className="p-8 border border-border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Create Your Superhero Avatar
          </h2>
          {isGenerating ? (
            <GenerationLoading />
          ) : (
            <div className="space-y-6">
              <ImageUpload onImageSelect={handleImageSelect} />
              <Button
                onClick={handleGenerate}
                disabled={!selectedFile || stats.credits < 10}
                className="w-full"
                size="lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                Generate Superhero Avatar (10 credits)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="Available Credits"
          value={stats.credits}
          icon={<Coins className="h-4 w-4" />}
          href="/pricing"
          description={
            stats.credits < 10 ? "Get more credits" : "Use for generations"
          }
        />
        <StatsCard
          label="Total Transformations"
          value={stats.totalGenerations}
          icon={<ImageIcon className="h-4 w-4" />}
          href="/gallery"
          description="View your gallery"
        />
        <StatsCard
          label="AI Chat Available"
          value="Active"
          icon={<MessageSquare className="h-4 w-4" />}
          href="/chat"
          description="Get superhero style tips"
        />
      </div>

      {/* Recent Generations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Recent Transformations</h2>
          {recentGenerations.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/gallery">View All</Link>
            </Button>
          )}
        </div>

        {recentGenerations.length === 0 ? (
          <EmptyState
            title="No transformations yet"
            description="Upload your first photo to create an amazing superhero avatar!"
            icon={<ImageIcon className="h-12 w-12" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentGenerations.map((gen) => (
              <Link
                key={gen.id}
                href="/gallery"
                className="group border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-square relative">
                  {gen.generatedImageUrl ? (
                    <img
                      src={gen.generatedImageUrl}
                      alt="Generated superhero"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      Processing...
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm text-muted-foreground">
                    {new Date(gen.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
