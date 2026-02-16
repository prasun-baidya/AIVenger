# AI-Powered Avatar Generation - Backend Implementation Guide

## Overview

This document provides comprehensive implementation details for the AI-powered avatar generation system in AIVenger, including database schema, server actions, API routes, and AI integration with OpenRouter's Gemini 2.5 Flash Image model.

## System Architecture

### Components
1. **Database Layer**: PostgreSQL with Drizzle ORM
   - User credits tracking
   - Generation records with status tracking

2. **Storage Layer**: Vercel Blob storage (production) / Local filesystem (development)
   - Original uploaded images
   - AI-generated avatar images

3. **AI Layer**: OpenRouter API with Google's Gemini 2.5 Flash Image model
   - Image-to-image transformation
   - Preserves facial features while adding superhero elements

4. **API Layer**: Next.js Server Actions + REST API routes
   - Protected generation endpoint with authentication
   - Generation history and stats endpoints
   - Credit validation and deduction

### Data Flow
```
User Upload → Blob Storage → Database (pending) → Deduct Credits →
OpenRouter API → Download Generated Image → Blob Storage →
Database (completed) → Return to User
```

## Database Schema

### User Table Updates

**Add credits column to existing user table:**

```typescript
// src/lib/schema.ts
import { pgTable, text, timestamp, boolean, index, integer } from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    credits: integer("credits").default(30).notNull(), // NEW: 30 free credits per user
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)]
);
```

### Generations Table

**New table to track all avatar generations:**

```typescript
export const generation = pgTable(
  "generation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `gen_${Date.now()}_${crypto.randomUUID()}`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    originalImageUrl: text("original_image_url").notNull(),
    generatedImageUrl: text("generated_image_url"), // Nullable during pending state
    creditsUsed: integer("credits_used").default(10).notNull(),
    status: text("status", { enum: ["pending", "completed", "failed"] })
      .default("pending")
      .notNull(),
    errorMessage: text("error_message"), // For debugging failed generations
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("generation_user_id_idx").on(table.userId), // Fast user queries
    index("generation_status_idx").on(table.status), // Filter by status
    index("generation_created_at_idx").on(table.createdAt), // Chronological ordering
  ]
);
```

**Schema Design Rationale:**
- **id**: Custom format `gen_${timestamp}_${uuid}` for easy debugging and uniqueness
- **userId**: Foreign key with cascade delete (cleanup on user deletion)
- **generatedImageUrl**: Nullable to support pending state before AI completes
- **creditsUsed**: Stored per generation for accurate billing history
- **status**: Three states for workflow tracking (pending → completed/failed)
- **errorMessage**: Captures AI API errors for troubleshooting
- **Indexes**: Optimized for common queries (by user, by status, chronological)

## Type Definitions

### Updated Generation Types

```typescript
// src/types/generation.ts
export interface GenerationData {
  id: string;
  userId: string;
  originalImageUrl: string;
  generatedImageUrl: string | null; // Nullable for pending state
  creditsUsed: number;
  status: "pending" | "completed" | "failed";
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalGenerations: number;
  lastGenerationDate?: Date;
  credits: number; // NEW: Current available credits
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
```

**Type Safety Features:**
- Discriminated union with `success` flag enables TypeScript narrowing
- Specific error codes for different failure scenarios
- Nullable fields properly typed for strict mode compliance

## Server Action Implementation

### Generate Avatar Server Action

**File: `src/app/actions/generate-avatar.ts`**

```typescript
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable, generation as generationTable } from "@/lib/schema";
import { upload } from "@/lib/storage";
import type { GenerateAvatarResult } from "@/types/generation";

export async function generateAvatar(
  formData: FormData
): Promise<GenerateAvatarResult> {
  // 1. Authentication Check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
  }

  const userId = session.user.id;

  try {
    // 2. Check User Credits
    const userRecord = await db.query.user.findFirst({
      where: eq(userTable.id, userId),
      columns: { credits: true },
    });

    if (!userRecord || userRecord.credits < 10) {
      return {
        success: false,
        error: "Insufficient credits. Upgrade your plan to continue.",
        code: "INSUFFICIENT_CREDITS",
      };
    }

    // 3. Extract Image from FormData
    const file = formData.get("image") as File;
    if (!file) {
      return {
        success: false,
        error: "No image provided",
        code: "UPLOAD_FAILED"
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Upload Original Image to Blob Storage
    const timestamp = Date.now();
    const originalFilename = `original_${userId}_${timestamp}_${file.name}`;
    const { url: originalImageUrl } = await upload(
      buffer,
      originalFilename,
      "avatars"
    );

    // 5. Create Pending Generation Record
    const generationId = `gen_${timestamp}_${crypto.randomUUID()}`;
    await db.insert(generationTable).values({
      id: generationId,
      userId,
      originalImageUrl,
      generatedImageUrl: null,
      status: "pending",
    });

    // 6. Deduct Credits IMMEDIATELY (before AI call to prevent abuse)
    await db
      .update(userTable)
      .set({ credits: userRecord.credits - 10 })
      .where(eq(userTable.id, userId));

    // 7. Call AI Generation
    let generatedImageUrl: string;
    try {
      generatedImageUrl = await callOpenRouterImageGeneration(originalImageUrl);
    } catch (aiError) {
      // Mark as failed but DON'T refund credits
      await db
        .update(generationTable)
        .set({
          status: "failed",
          errorMessage: aiError instanceof Error ? aiError.message : "AI generation failed",
        })
        .where(eq(generationTable.id, generationId));

      return {
        success: false,
        error: "AI generation failed. Please try again later.",
        code: "AI_GENERATION_FAILED",
      };
    }

    // 8. Download and Re-Upload Generated Image to Blob Storage
    const generatedResponse = await fetch(generatedImageUrl);
    const generatedBuffer = Buffer.from(await generatedResponse.arrayBuffer());
    const generatedFilename = `generated_${userId}_${timestamp}.png`;
    const { url: finalGeneratedUrl } = await upload(
      generatedBuffer,
      generatedFilename,
      "avatars"
    );

    // 9. Update Generation to Completed
    await db
      .update(generationTable)
      .set({
        generatedImageUrl: finalGeneratedUrl,
        status: "completed",
      })
      .where(eq(generationTable.id, generationId));

    // 10. Fetch Final Record and Return
    const finalGeneration = await db.query.generation.findFirst({
      where: eq(generationTable.id, generationId),
    });

    // Revalidate pages to show updated data
    revalidatePath("/dashboard");
    revalidatePath("/gallery");

    return {
      success: true,
      generation: finalGeneration!,
      remainingCredits: userRecord.credits - 10,
    };
  } catch (error) {
    console.error("Unexpected generation error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      code: "DATABASE_ERROR",
    };
  }
}

/**
 * Call OpenRouter API with Gemini 2.5 Flash Image model
 * @param referenceImageUrl - Public URL of the original image
 * @returns Public URL of the generated image
 */
async function callOpenRouterImageGeneration(
  referenceImageUrl: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const MODEL = "google/gemini-2.5-flash-image";

  // Detailed narrative prompt (not keyword list)
  const prompt = `Transform this person into an epic superhero character. Preserve their facial features and identity while adding:
- A heroic costume with bold colors and iconic design elements
- Dramatic cinematic lighting with strong contrast and depth
- A powerful, confident pose that conveys strength and heroism
- Dynamic background with energy effects or cityscape
- Professional comic book or movie poster aesthetic

Maintain the original aspect ratio. Create a stunning, photorealistic superhero transformation that stays true to the person's appearance.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "AIVenger",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: referenceImageUrl }
            },
          ],
        },
      ],
      modalities: ["image"], // CRITICAL: Enables image generation
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  // Extract image URL from response
  const imageUrl = data.choices?.[0]?.message?.content?.find(
    (item: { type: string }) => item.type === "image_url"
  )?.image_url?.url;

  if (!imageUrl) {
    console.error("Full OpenRouter response:", JSON.stringify(data, null, 2));
    throw new Error("No image URL in OpenRouter response");
  }

  return imageUrl;
}
```

**Key Implementation Decisions:**

1. **Credits Deducted Before AI Call**: Prevents abuse from infinite retries. This is intentional design - no refund on AI failures.

2. **Three-Stage Upload Process**:
   - Original image → Blob storage (permanent)
   - AI generation → Temporary Google URL
   - Generated image → Re-upload to Blob storage (permanent)

   This ensures we control the storage and images persist even if Google's temporary URLs expire.

3. **Pending → Completed/Failed State Machine**: Database record created immediately in "pending" state, then updated on completion or failure.

4. **Error Handling**: Specific error codes enable frontend to show appropriate messages and actions.

## API Routes

### 1. List Generations

**File: `src/app/api/generations/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { desc, eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generation as generationTable } from "@/lib/schema";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!)
    : undefined;
  const status = searchParams.get("status") as
    | "pending"
    | "completed"
    | "failed"
    | null;

  try {
    const where = status
      ? and(
          eq(generationTable.userId, session.user.id),
          eq(generationTable.status, status)
        )
      : eq(generationTable.userId, session.user.id);

    const generations = await db.query.generation.findMany({
      where,
      orderBy: [desc(generationTable.createdAt)],
      limit,
    });

    return NextResponse.json({
      generations,
      count: generations.length
    });
  } catch (error) {
    console.error("Failed to fetch generations:", error);
    return NextResponse.json(
      { error: "Failed to fetch" },
      { status: 500 }
    );
  }
}
```

**Query Parameters:**
- `limit` (optional): Limit number of results
- `status` (optional): Filter by status ("pending" | "completed" | "failed")

**Example Usage:**
```
GET /api/generations?status=completed&limit=10
```

### 2. User Stats

**File: `src/app/api/user/stats/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and, count, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable, generation as generationTable } from "@/lib/schema";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user credits
    const userRecord = await db.query.user.findFirst({
      where: eq(userTable.id, session.user.id),
      columns: { credits: true },
    });

    // Count completed generations
    const completedCount = await db
      .select({ count: count() })
      .from(generationTable)
      .where(
        and(
          eq(generationTable.userId, session.user.id),
          eq(generationTable.status, "completed")
        )
      );

    // Get most recent generation
    const recent = await db.query.generation.findFirst({
      where: and(
        eq(generationTable.userId, session.user.id),
        eq(generationTable.status, "completed")
      ),
      orderBy: [desc(generationTable.createdAt)],
      columns: { createdAt: true },
    });

    return NextResponse.json({
      credits: userRecord?.credits ?? 30,
      totalGenerations: completedCount[0]?.count ?? 0,
      lastGenerationDate: recent?.createdAt ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
```

**Response Format:**
```json
{
  "credits": 20,
  "totalGenerations": 3,
  "lastGenerationDate": "2026-02-16T10:30:00Z"
}
```

### 3. Delete Generation

**File: `src/app/api/generations/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generation as generationTable } from "@/lib/schema";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify ownership
    const generation = await db.query.generation.findFirst({
      where: and(
        eq(generationTable.id, id),
        eq(generationTable.userId, session.user.id)
      ),
    });

    if (!generation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete images from blob storage
    await deleteFile(generation.originalImageUrl);
    if (generation.generatedImageUrl) {
      await deleteFile(generation.generatedImageUrl);
    }

    // Delete database record
    await db.delete(generationTable).where(eq(generationTable.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete:", error);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
```

**Security Features:**
- Ownership verification (users can only delete their own generations)
- Cleanup of both original and generated images from blob storage
- Transactional delete (database record removed after blob cleanup)

## AI Integration Details

### OpenRouter API Overview

**Model:** `google/gemini-2.5-flash-image`
**Provider:** Google via OpenRouter
**Capabilities:**
- Image-to-image transformation with reference image support
- Preserves aspect ratio by default
- Multi-turn conversational editing
- Targeted transformations (style, color, elements)

**Pricing:** ~$0.039 per image (~1,290 tokens at $30/million)

**Documentation:**
- [Model Page](https://openrouter.ai/google/gemini-2.5-flash-image)
- [Image Generation Guide](https://openrouter.ai/docs/guides/overview/multimodal/image-generation)
- [Prompting Best Practices](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)

### Request Format

```typescript
{
  model: "google/gemini-2.5-flash-image",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "[detailed narrative prompt]" },
        { type: "image_url", image_url: { url: "[reference image URL]" } }
      ]
    }
  ],
  modalities: ["image"] // CRITICAL: Enables image generation
}
```

### Response Format

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": [
          {
            "type": "image_url",
            "image_url": {
              "url": "https://storage.googleapis.com/generativeai-downloads/images/..."
            }
          }
        ]
      }
    }
  ],
  "usage": {
    "prompt_tokens": 1234,
    "completion_tokens": 56,
    "total_tokens": 1290
  }
}
```

### Prompt Engineering Guidelines

**Best Practices:**
1. **Use Narrative Descriptions** - Not keyword lists
2. **Be Explicit About Preservation** - "preserve facial features and identity"
3. **Specify Aspect Ratio** - "Maintain the original aspect ratio"
4. **Detail Level** - More details = better results
5. **Quality Keywords** - "photorealistic", "cinematic", "professional"

**Superhero Prompt Template:**
```
Transform this person into an epic superhero character. Preserve their facial features and identity while adding:
- A heroic costume with bold colors and iconic design elements
- Dramatic cinematic lighting with strong contrast and depth
- A powerful, confident pose that conveys strength and heroism
- Dynamic background with energy effects or cityscape
- Professional comic book or movie poster aesthetic

Maintain the original aspect ratio. Create a stunning, photorealistic superhero transformation that stays true to the person's appearance.
```

**Alternative Style Templates:**

*Marvel Cinematic Universe:*
```
Transform this person into a Marvel Cinematic Universe superhero. Keep their face recognizable while adding:
- MCU-style tactical superhero suit with metallic accents
- Studio lighting with blue/orange color grading
- Heroic stance with slight lens flare effects
- Urban or cosmic background
- Cinematic movie poster quality

Preserve facial features and maintain original aspect ratio.
```

*DC Comics Dark Knight:*
```
Transform this person into a DC Comics superhero. Preserve their identity while adding:
- Classic DC superhero costume with cape and emblem
- Dark, dramatic noir lighting with high contrast
- Powerful heroic pose with determination in their expression
- Gotham city or Metropolis backdrop
- Comic book cover aesthetic with bold colors

Keep facial features intact and maintain aspect ratio.
```

### Error Handling

**Common Scenarios:**

1. **Invalid API Key**
```typescript
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY not configured");
}
```

2. **Rate Limits**
```typescript
if (response.status === 429) {
  throw new Error("Rate limit exceeded. Please try again in a moment.");
}
```

3. **Model Unavailable**
```typescript
if (response.status === 503) {
  throw new Error("AI model temporarily unavailable. Please try again later.");
}
```

4. **No Image in Response**
```typescript
if (!imageUrl) {
  console.error("Full OpenRouter response:", JSON.stringify(data, null, 2));
  throw new Error("No image URL in OpenRouter response");
}
```

## Environment Variables

### Required Configuration

```env
# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/db_name

# Better Auth
BETTER_AUTH_SECRET=32-char-random-string

# AI via OpenRouter
OPENROUTER_API_KEY=sk-or-v1-your-key-here  # Get from https://openrouter.ai/settings/keys

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# File Storage (optional - uses local storage if not set)
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### Verification

Test OpenRouter connection:
```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

## Database Migrations

### Generate and Apply Migrations

```bash
# Generate migration SQL
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Open database GUI to verify
pnpm db:studio
```

### Rollback Strategy

If you need to rollback:
```bash
# View migration history
pnpm drizzle-kit migrations:list

# Rollback specific migration (not built-in - manual SQL needed)
psql $POSTGRES_URL -c "DROP TABLE generation; ALTER TABLE user DROP COLUMN credits;"
```

## Testing Strategy

### Unit Testing Checklist

- [ ] Verify API key validation
- [ ] Test with valid reference image URL
- [ ] Test with invalid/missing reference URL
- [ ] Test error handling for 429, 503, 500 responses
- [ ] Verify response parsing
- [ ] Test credit validation logic
- [ ] Test generation state transitions

### Integration Testing Checklist

- [ ] Upload test image → verify blob storage URL
- [ ] Call OpenRouter with blob URL → verify image returned
- [ ] Download generated image → verify valid image data
- [ ] Re-upload to blob → verify final storage URL
- [ ] Verify credits deducted correctly
- [ ] Verify database records created/updated

### End-to-End Testing Flow

1. **Setup:**
   ```bash
   pnpm db:migrate
   pnpm dev
   ```

2. **Happy Path:**
   - Navigate to `/dashboard`
   - Verify 30 credits displayed
   - Upload portrait image (JPEG/PNG, <10MB)
   - Click "Generate Superhero Avatar (10 credits)"
   - Wait for completion (~5-10 seconds)
   - Verify success toast with 20 credits remaining
   - Verify generated avatar in "Recent Transformations"
   - Navigate to `/gallery`
   - Verify generation appears
   - Verify credits display shows 20

3. **Insufficient Credits:**
   - Use `pnpm db:studio` to set user credits to 5
   - Reload dashboard
   - Verify generate button disabled
   - Verify error toast if attempted

4. **Delete Generation:**
   - In gallery, click delete
   - Verify generation removed
   - Check database - record gone
   - Check blob storage - images deleted

5. **Error Handling:**
   - Set invalid `OPENROUTER_API_KEY`
   - Attempt generation
   - Verify error toast
   - Verify credits still deducted
   - Verify generation status = "failed"

## Performance Considerations

### Optimization Strategies

1. **Image Compression**: Consider adding image compression before upload to reduce storage costs

2. **Caching**: Cache successful generations for re-use if user requests same transformation

3. **Background Processing**: Future enhancement - use job queue (e.g., BullMQ) for async generation

4. **Rate Limiting**: Add rate limiting per user to prevent abuse

5. **Pagination**: Implement cursor-based pagination for generation history

### Storage Cost Estimates

**Assumptions:**
- Average image size: 2MB (original + generated)
- 1000 users, 10 generations each = 20,000 images
- Total storage: 20,000 × 2MB = 40GB

**Vercel Blob Pricing:**
- First 100GB: Free
- Beyond: $0.15/GB/month

**Estimated Cost:** $0 for first 50,000 generations

## Security Considerations

### Authentication & Authorization

- All API routes check session with `auth.api.getSession()`
- Server actions verify user identity before processing
- Generation deletion verifies ownership

### Input Validation

- File type validation (MIME type check)
- File size limits (recommended: 10MB max)
- Sanitize filenames to prevent path traversal

### Rate Limiting

Consider implementing:
```typescript
// Example rate limit check
const recentGenerations = await db.query.generation.findMany({
  where: and(
    eq(generationTable.userId, userId),
    gte(generationTable.createdAt, new Date(Date.now() - 60000)) // Last minute
  ),
});

if (recentGenerations.length >= 5) {
  return {
    success: false,
    error: "Rate limit exceeded. Please wait before generating again.",
    code: "RATE_LIMITED"
  };
}
```

### API Key Security

- Never expose `OPENROUTER_API_KEY` to client
- All AI calls must go through server actions or API routes
- Rotate keys periodically

## Future Enhancements

### Planned Features

1. **Style Selection**: Let users choose transformation styles (Marvel, DC, anime, realistic)

2. **Prompt Customization**: Allow users to specify costume colors, powers, background

3. **Multi-Model Support**: Test other models (DALL-E, Stable Diffusion)

4. **Batch Generation**: Generate multiple variations at once

5. **Progress Tracking**: WebSocket or polling for real-time status

6. **Social Sharing**: Share generated avatars with custom URLs

7. **Credit Packages**: Integrate Polar payments for credit purchases

8. **Fine-Tuning**: Custom model training on user's previous generations

9. **Generation History Pagination**: Cursor-based pagination for large histories

10. **Image Editing Tools**: Allow refinements to generated images

### Monitoring & Analytics

Track metrics:
- Average generation time
- Success/failure rates
- Credit consumption patterns
- Popular generation times
- User retention after first generation

## Troubleshooting

### Common Issues

**1. "Insufficient credits" immediately after signup**
- Check if default credits (30) are set in schema
- Verify migration applied correctly
- Check database with `pnpm db:studio`

**2. "OPENROUTER_API_KEY not configured"**
- Verify `.env` has correct key
- Restart dev server after adding key
- Test key with curl command

**3. Generated image URL expires**
- Google's temporary URLs expire after ~1 hour
- This is why we re-upload to blob storage immediately
- If you see expired URLs, check the re-upload logic

**4. Credits deducted but no image generated**
- This is by design (prevents abuse)
- Check generation status in database
- View errorMessage field for details

**5. TypeScript errors after schema changes**
- Run `pnpm db:generate` to update types
- Restart TypeScript server in IDE
- Run `pnpm typecheck` to verify

## Appendix

### File Structure

```
src/
├── app/
│   ├── actions/
│   │   └── generate-avatar.ts          # NEW: Server action
│   ├── api/
│   │   ├── generations/
│   │   │   ├── route.ts                # NEW: List generations
│   │   │   └── [id]/
│   │   │       └── route.ts            # NEW: Delete generation
│   │   └── user/
│   │       └── stats/
│   │           └── route.ts            # NEW: User stats
│   ├── dashboard/
│   │   └── page.tsx                    # MODIFIED: Integrate credits & server action
│   └── gallery/
│       └── page.tsx                    # MODIFIED: Fetch from API instead of localStorage
├── lib/
│   ├── schema.ts                       # MODIFIED: Add credits, generation table
│   └── storage.ts                      # EXISTING: Use for blob operations
└── types/
    └── generation.ts                   # MODIFIED: Add credits, result types
```

### Database Relations Diagram

```
┌─────────────┐
│    user     │
├─────────────┤
│ id (PK)     │
│ name        │
│ email       │
│ credits     │◄──────┐
│ ...         │       │
└─────────────┘       │
                      │
                      │ Foreign Key
                      │ (CASCADE DELETE)
                      │
┌─────────────────────┼─┐
│    generation       │ │
├─────────────────────┼─┤
│ id (PK)             │ │
│ userId (FK) ────────┘ │
│ originalImageUrl      │
│ generatedImageUrl     │
│ creditsUsed           │
│ status                │
│ errorMessage          │
│ createdAt             │
│ updatedAt             │
└───────────────────────┘
```

### Credits Economy Design

**Free Tier:**
- 30 credits on signup
- 10 credits per generation
- 3 free generations total

**Paid Tiers (Future):**
- Basic: $9.99/month → 100 credits/month (10 generations)
- Pro: $29.99/month → 300 credits/month (30 generations) + priority queue
- Enterprise: Custom → Unlimited generations + API access

**Credit Refund Policy:**
- No refunds on AI failures (prevents abuse)
- Refunds only for upload failures (before AI call)
- Manual refunds by admin for legitimate issues

---

*Last Updated: 2026-02-16*
*Version: 1.0*
