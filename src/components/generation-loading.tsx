"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const LOADING_MESSAGES = [
  "Transforming you into a superhero...",
  "Adding superpowers...",
  "Channeling your inner Avenger...",
  "Applying heroic enhancements...",
  "Activating superhuman abilities...",
  "Forging your legendary armor...",
  "Unleashing your true potential...",
  "Summoning epic powers...",
];

export function GenerationLoading() {
  // Pick a random message on initialization
  const [message] = useState(() => {
    const randomMessage =
      LOADING_MESSAGES[
        Math.floor(Math.random() * LOADING_MESSAGES.length)
      ] ?? "Processing...";
    return randomMessage;
  });

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium text-center">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">
        This may take a few seconds
      </p>
    </div>
  );
}
