"use client";

import { useState, useEffect } from "react";
import { Lock, Image as ImageIcon } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { EmptyState } from "@/components/empty-state";
import { GalleryItem } from "@/components/gallery-item";
import { useSession } from "@/lib/auth-client";
import { getGenerations, deleteGeneration } from "@/lib/storage-helpers";
import type { GenerationData } from "@/types/generation";

export default function GalleryPage() {
  const { data: session, isPending } = useSession();
  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadGenerations();
    }
  }, [session]);

  const loadGenerations = () => {
    setIsLoading(true);
    try {
      const allGenerations = getGenerations();
      setGenerations(allGenerations);
    } catch (error) {
      console.error("Error loading generations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteGeneration(id);
      loadGenerations(); // Reload after deletion
    } catch (error) {
      console.error("Error deleting generation:", error);
    }
  };

  if (isPending || isLoading) {
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
              You need to sign in to access your gallery
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Superhero Gallery</h1>
        <p className="text-muted-foreground">
          All your amazing superhero transformations in one place
        </p>
      </div>

      {generations.length === 0 ? (
        <EmptyState
          title="No transformations yet"
          description="You haven't created any superhero avatars yet. Head to the dashboard to create your first transformation!"
          actionLabel="Go to Dashboard"
          actionHref="/dashboard"
          icon={<ImageIcon className="h-16 w-16" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {generations.map((generation) => (
            <GalleryItem
              key={generation.id}
              generation={generation}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
