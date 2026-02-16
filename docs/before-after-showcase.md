# Before/After Showcase Component

## Overview

The landing page now includes an interactive before/after comparison slider that showcases superhero avatar transformations.

## Current Setup

The component uses **real photos from Unsplash**:

### Before Images (Regular People)
- Example 1: Professional headshot - Male portrait
- Example 2: Professional headshot - Female portrait
- Example 3: Professional headshot - Male portrait

### After Images (Superhero Style)
- Example 1: Iron Man-inspired armor look (red/gold metallic)
- Example 2: Electric/Thunder warrior with neon effects
- Example 3: Dark mysterious hero (Batman-style)

## How It Works

Users can **drag a slider left and right** to compare the before and after images. The component:
- ✅ Works on desktop (mouse) and mobile (touch)
- ✅ Shows "Before" and "After" labels
- ✅ Displays helpful "Drag to compare" hint on hover
- ✅ Fully responsive design

## Customizing with Your Own Images

When you have real AI-generated superhero transformations, update the images in:

**File:** `src/components/before-after-showcase.tsx`

```typescript
const SHOWCASE_ITEMS = [
  {
    id: 1,
    before: "/your-images/customer-photo-1.jpg",  // Your customer's original photo
    after: "/your-images/superhero-1.jpg",        // AI-generated superhero version
    title: "The Iron Guardian",
    description: "Tech-powered hero with advanced armor",
  },
  // ... more examples
];
```

### Using Local Images

1. Place images in `public/showcase/` directory:
   ```
   public/
   └── showcase/
       ├── before-1.jpg
       ├── after-1.jpg
       ├── before-2.jpg
       ├── after-2.jpg
       etc...
   ```

2. Update the paths:
   ```typescript
   before: "/showcase/before-1.jpg",
   after: "/showcase/after-1.jpg",
   ```

### Using External URLs

If using a CDN or external storage:

1. Add your domain to `next.config.ts`:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: "https",
         hostname: "your-cdn.com",
       },
     ],
   }
   ```

2. Use full URLs in the component:
   ```typescript
   before: "https://your-cdn.com/images/before-1.jpg",
   after: "https://your-cdn.com/images/after-1.jpg",
   ```

## Image Recommendations

- **Dimensions:** 400x500px (4:5 aspect ratio)
- **Format:** JPG or PNG
- **Size:** Optimized for web (< 200KB per image)
- **Quality:** High resolution for clear comparison
- **Subject:** Clear face/portrait shots work best for before images

## Adding More Examples

Simply add more items to the `SHOWCASE_ITEMS` array:

```typescript
const SHOWCASE_ITEMS = [
  // ... existing items
  {
    id: 4,
    before: "/showcase/before-4.jpg",
    after: "/showcase/after-4.jpg",
    title: "The Phoenix Flame",
    description: "Fire-powered hero with energy wings",
  },
];
```

The grid will automatically adjust to show all examples (currently displays 3 per row on desktop).

## Troubleshooting

### Images Not Loading?

1. **Check Next.js config** - External domains must be in `remotePatterns`
2. **Verify file paths** - Local images should be in `/public/` directory
3. **Restart dev server** - Required after changing `next.config.ts`

### Slider Not Working?

- Make sure JavaScript is enabled
- Check browser console for errors
- Verify the component has `"use client"` directive

### Images Look Stretched?

- Use `object-cover` class (already applied)
- Maintain 4:5 aspect ratio for source images
- Or adjust the `aspect-[4/5]` class to match your images
