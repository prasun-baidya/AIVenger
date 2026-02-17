"use client";

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { GenerationData } from "@/types/generation";

interface GalleryItemProps {
  generation: GenerationData;
  onDelete: (id: string) => void;
}

export function GalleryItem({ generation, onDelete }: GalleryItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = async () => {
    try {
      if (!generation.generatedImageUrl) {
        toast.error("No generated image available");
        return;
      }

      toast.info("Preparing download...");

      // Fetch the image as a blob to handle CORS and Vercel Blob URLs
      const response = await fetch(generation.generatedImageUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob);

      // Create and trigger download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `superhero-${generation.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const handleDelete = () => {
    onDelete(generation.id);
    setShowDeleteDialog(false);
    toast.success("Transformation deleted");
  };

  return (
    <>
      <div
        className="group relative border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Grid - Before/After */}
        <div className="grid grid-cols-2 gap-1">
          <div className="aspect-square relative bg-muted">
            <img
              src={generation.originalImageUrl}
              alt="Original photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
              Before
            </div>
          </div>
          <div className="aspect-square relative bg-muted">
            {generation.generatedImageUrl ? (
              <img
                src={generation.generatedImageUrl}
                alt="Superhero transformation"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Processing...
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded">
              Superhero
            </div>
          </div>
        </div>

        {/* Info Section with Action Buttons */}
        <div className="p-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {new Date(generation.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="outline"
              size="sm"
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Action Buttons - Visible on Hover (Desktop Enhancement) */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 transition-opacity">
            <Button
              onClick={handleDownload}
              variant="secondary"
              size="lg"
              className="shadow-lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Download
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              size="lg"
              className="shadow-lg"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transformation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              superhero transformation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
