"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Using real sample photos from Unsplash for "before" images
// and enhanced SVG graphics for "after" superhero transformations
const SHOWCASE_ITEMS = [
  {
    id: 1,
    before: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=faces",
    after: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=500&fit=crop", // Iron Man style
    title: "The Iron Guardian",
    description: "Tech-powered hero with advanced armor",
  },
  {
    id: 2,
    before: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=faces",
    after: "https://images.unsplash.com/photo-1609743522653-52354461eb27?w=400&h=500&fit=crop", // Electric/neon style
    title: "Thunder Warrior",
    description: "Lightning-fast hero with electric powers",
  },
  {
    id: 3,
    before: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=faces",
    after: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&h=500&fit=crop", // Dark/mysterious style
    title: "Shadow Defender",
    description: "Mysterious hero from the shadows",
  },
];

function ImageComparisonSlider({
  before,
  after,
  title,
}: {
  before: string;
  after: string;
  title: string;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== "click") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0]!.clientX - rect.left : e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div
      className="relative w-full aspect-[4/5] overflow-hidden rounded-lg cursor-col-resize select-none group bg-muted"
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMove}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={handleMove}
      onClick={handleMove}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={after}
          alt={`${title} - After`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
        />
        {/* Superhero effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-lg z-20">
          After
        </div>
      </div>

      {/* Before Image (Overlay with clip) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={before}
          alt={`${title} - Before`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
        />
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 text-white text-xs font-semibold rounded-full shadow-lg z-20">
          Before
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-30"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-gray-600 rounded"></div>
            <div className="w-0.5 h-4 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>

      {/* Instruction hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        ← Drag to compare →
      </div>
    </div>
  );
}

export function BeforeAfterShowcase() {
  return (
    <section className="w-full py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            See the{" "}
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Transformation
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch ordinary photos transform into extraordinary superhero avatars
            with the power of AI. Drag the slider to compare!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SHOWCASE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden border border-border bg-card hover:shadow-2xl transition-all duration-300"
            >
              <ImageComparisonSlider
                before={item.before}
                after={item.after}
                title={item.title}
              />

              <div className="p-6 bg-card border-t">
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <ArrowRight className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Create your own superhero transformation in minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
