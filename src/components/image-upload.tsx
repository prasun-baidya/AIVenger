"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  maxSize?: number; // in MB
  accept?: string;
}

export function ImageUpload({
  onImageSelect,
  maxSize = 10,
  accept = "image/jpeg,image/png,image/jpg,image/webp",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      // Check file type
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      if (!acceptedTypes.includes(file.type)) {
        toast.error(
          `Invalid file type. Please upload: ${acceptedTypes.join(", ")}`
        );
        return;
      }

      // Check file size
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error(`File size must be less than ${maxSize}MB`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setPreview(previewUrl);
        setSelectedFile(file);
        onImageSelect(file, previewUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect, maxSize, accept]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file) {
        handleFile(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        handleFile(file);
      }
    }
  };

  const clearImage = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  if (preview) {
    return (
      <div className="relative w-full">
        <div className="relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden border-2 border-border">
          <img
            src={preview}
            alt="Selected image"
            className="w-full h-full object-cover"
          />
        </div>
        <Button
          onClick={clearImage}
          variant="outline"
          size="sm"
          className="absolute top-2 right-2"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </Button>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {selectedFile?.name}
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-8 transition-all
        ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }
      `}
    >
      <input
        type="file"
        id="image-upload"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload image"
      />
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-full bg-primary/10">
          {isDragging ? (
            <Upload className="h-8 w-8 text-primary" />
          ) : (
            <ImageIcon className="h-8 w-8 text-primary" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium mb-1">
            {isDragging ? "Drop your image here" : "Upload your photo"}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Supports: JPG, PNG, WebP • Max size: {maxSize}MB
        </p>
      </div>
    </div>
  );
}
