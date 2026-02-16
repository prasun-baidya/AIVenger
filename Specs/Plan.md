# AIVenger Superhero Transformation SaaS - Product Plan

## Context

The user wants to transform the current AIVenger boilerplate into a full SaaS application where users can upload photos of themselves, friends, family, or pets, and have AI transform them into Avengers-style superhero images.

**Current State**: The project already has excellent superhero-themed landing page, authentication system (BetterAuth), database (PostgreSQL + Drizzle), and file storage abstraction. The branding ("AIVenger") and design aesthetic perfectly align with the superhero transformation concept.

**Goal**: This plan focuses exclusively on UI components and user experience. No backend logic will be implemented at this stage - we're creating a fully functional UI demo that shows the complete user journey with mock data and placeholder states.

## User Decisions

- Use placeholder images for before/after examples on landing page
- Simple workflow: Upload → Generate (no style selection at this stage)
- Mock generation: Show loading animation (3-5 seconds), then display uploaded image as "result"
- Keep chat page for AI assistance about superhero styles
- Use localStorage for temporary data storage (before real database integration)

## Pages Overview

### Pages to Modify

1. **Landing Page** (`src/app/page.tsx`)
   - Status: ~80% done
   - Changes: Add before/after showcase section, update copy for new workflow
   - Keep existing excellent structure and animations

2. **Dashboard** (`src/app/dashboard/page.tsx`)
   - Status: Requires complete rebuild
   - Changes: New upload section, generation workflow, recent generations display
   - Maintain authentication check

3. **Chat Page** (`src/app/chat/page.tsx`)
   - Status: ~95% done
   - Changes: Minor copy updates, add superhero-related starter prompts

### Pages to Create

1. **Gallery Page** (`src/app/gallery/page.tsx`)
   - Masonry grid layout for all user transformations
   - Before/after display, download/delete functionality
   - Empty state with friendly CTA

2. **Documentation Section** (`src/app/docs/`)
   - Getting Started page (docs home)
   - How to Use guide
   - FAQ with accordion UI
   - Docs layout with sidebar navigation

3. **Legal Pages** (`src/app/(legal)/`)
   - Privacy Policy
   - Terms of Service
   - About page
   - Contact page with form UI

4. **Pricing Page** (`src/app/pricing/page.tsx`)
   - 3 tiers (Free, Pro, Enterprise)
   - All marked as "Coming Soon"
   - Comparison table and pricing FAQ

### Navigation Updates

- **Header**: Add Dashboard, Gallery, Pricing, Docs, Chat links
- **Footer**: Expand with Product, Resources, Legal, Social sections

## New Components Required

1. **Image Upload Component** (`src/components/image-upload.tsx`)
   - Drag-and-drop with click-to-browse fallback
   - Image preview, validation, error handling

2. **Generation Loading** (`src/components/generation-loading.tsx`)
   - Animated spinner/progress indicator
   - Randomized encouraging messages

3. **Gallery Item** (`src/components/gallery-item.tsx`)
   - Before/after image display
   - Download and delete actions
   - Hover effects

4. **Empty State** (`src/components/empty-state.tsx`)
   - Reusable for Gallery and Dashboard
   - Configurable with title, description, CTA

5. **Before/After Showcase** (`src/components/before-after-showcase.tsx`)
   - Landing page transformation examples
   - Placeholder images with smooth transitions

6. **Stats Card** (`src/components/stats-card.tsx`)
   - Display counts and metrics
   - Optional navigation links

7. **Docs Navigation** (`src/components/docs-nav.tsx`)
   - Sidebar for documentation section
   - Mobile-responsive drawer

8. **Pricing Tier Card** (`src/components/pricing-tier-card.tsx`)
   - Individual pricing tier display
   - Feature lists, CTA buttons, badges

## Data Types & Interfaces

### GenerationData

```typescript
export interface GenerationData {
  id: string;
  userId: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  createdAt: Date;
  status: "pending" | "completed" | "failed";
}
```

### PricingTier

```typescript
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
```

## State Management Strategy

### Using localStorage for Demo

**Rationale**: Allows full UI testing without backend, data persists across sessions, easy migration to database later.

**Storage Keys**:
- `aivenger_generations` - Array of GenerationData objects
- `aivenger_user_stats` - Object with counts and metadata

**Helper Functions** (`src/lib/storage-helpers.ts`):
```typescript
export function getGenerations(): GenerationData[]
export function addGeneration(data: GenerationData): void
export function deleteGeneration(id: string): void
export function getStats(): { totalGenerations: number, ... }
```

## Design Principles

1. **Consistency**: Reuse existing shadcn/ui components and Tailwind patterns
2. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
3. **Responsiveness**: Mobile-first, test all breakpoints
4. **Performance**: Lazy load images, optimize animations, use skeletons
5. **User Feedback**: Loading states, error messages, success toasts
6. **Dark Mode**: Support both themes on all new components
7. **TypeScript Strict**: Handle all undefined/null cases, proper typing
8. **No Backend**: All generation logic is mock/placeholder for now

## Notes & Considerations

- The existing landing page design is excellent - only minor additions needed
- Authentication system is fully functional - just use it for route protection
- Chat page is well-implemented - minimal changes needed
- Storage abstraction is ready - will be used when backend is integrated
- Current branding (AIVenger, red-orange-yellow gradient) is perfect for superhero theme
- All new components should match existing design aesthetic
- Focus on creating a polished demo that showcases the complete user journey
- Legal content should be placeholder templates (user will replace with real legal text)
- Documentation should be helpful and friendly (target non-technical users)

## User Journey (End-to-End)

1. Visit landing page, see before/after showcase
2. Click "Get Started", register account
3. Redirected to dashboard
4. Upload an image (drag-and-drop or click)
5. Click "Generate Superhero Avatar"
6. See loading animation for 3-5 seconds
7. See uploaded image displayed as "generated result"
8. Result appears in "Recent Generations" section
9. Click "View Gallery"
10. See the generation in gallery masonry grid
11. Download or delete images
12. Explore docs, pricing, and chat features

## Success Criteria

- All pages render correctly in light and dark mode
- Complete user journey works from signup to gallery
- Mock generation saves to localStorage and persists
- Responsive design works on mobile, tablet, desktop
- All authentication guards work properly
- `pnpm check` passes with no errors
- No console errors in browser
- All navigation links work correctly
