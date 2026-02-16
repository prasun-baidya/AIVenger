 Changes:
 1. Import server action: import { generateAvatar } from "@/app/actions/generate-avatar"
 2. Add credits to stats state: credits: 30
 3. Load stats from /api/user/stats API
 4. Update handleGenerate():
   - Check credits client-side for UX (show error toast if <10)
   - Create FormData with uploaded image
   - Call generateAvatar(formData)
   - Handle result: show success/error toasts with specific messages
   - Update local stats with remaining credits
   - Reload recent generations
 5. Add credits stats card with Coins icon
 6. Update generate button text: "Generate Superhero Avatar (10 credits)"
 7. Disable button if stats.credits < 10

 Toast for Insufficient Credits:
 toast.error("Insufficient credits", {
   description: "You need 10 credits. Upgrade your plan to continue.",
   action: {
     label: "View Plans",
     onClick: () => window.location.href = "/pricing",
   },
 });

 6. Update Gallery Page

 File: src/app/gallery/page.tsx

 Changes:
 1. Replace getGenerations() localStorage calls with API fetch:
 const response = await fetch("/api/generations?status=completed");
 const data = await response.json();
 setGenerations(data.generations);
 2. Update handleDelete() to call DELETE API:
 await fetch(`/api/generations/${id}`, { method: "DELETE" });
 3. Remove imports from @/lib/storage-helpers (deprecated)

 7. Optional: Deprecate localStorage Helper

 File: src/lib/storage-helpers.ts

 - Add deprecation comment at top
 - Keep file for backward compatibility but don't use in new code
 - Consider migration script if production has localStorage data

 ---
 Documentation Content to Add to specs/Implementation.md

 Add the following sections after "Next Steps After Implementation" (line 507):

 Backend Integration: Avatar Generation System

 Overview

 Replace the localStorage-based simulation with a complete backend system featuring:
 - Credits System: 30 free credits per user, 10 credits per generation
 - PostgreSQL Database: New generations table to track all user generations
 - Vercel Blob Storage: Persistent storage for both original and generated images
 - Protected Server Actions: Authentication, authorization, and credit validation

 Database Schema Implementation

 Add to src/lib/schema.ts:

 1. Credits Column in User Table
 import { pgTable, text, timestamp, boolean, index, integer } from "drizzle-orm/pg-core";

 export const user = pgTable(
   "user",
   {
     id: text("id").primaryKey(),
     name: text("name").notNull(),
     email: text("email").notNull().unique(),
     emailVerified: boolean("email_verified").default(false).notNull(),
     image: text("image"),
     credits: integer("credits").default(30).notNull(), // NEW: 30 free credits
     createdAt: timestamp("created_at").defaultNow().notNull(),
     updatedAt: timestamp("updated_at")
       .defaultNow()
       .$onUpdate(() => new Date())
       .notNull(),
   },
   (table) => [index("user_email_idx").on(table.email)]
 );

 2. Generations Table
 export const generation = pgTable(
   "generation",
   {
     id: text("id").primaryKey().$defaultFn(() => `gen_${Date.now()}_${crypto.randomUUID()}`),
     userId: text("user_id")
       .notNull()
       .references(() => user.id, { onDelete: "cascade" }),
     originalImageUrl: text("original_image_url").notNull(),
     generatedImageUrl: text("generated_image_url"), // Nullable during pending
     creditsUsed: integer("credits_used").default(10).notNull(),
     status: text("status", { enum: ["pending", "completed", "failed"] })
       .default("pending")
       .notNull(),
     errorMessage: text("error_message"), // For debugging
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

 Run Migrations:
 pnpm db:generate  # Creates migration SQL
 pnpm db:migrate   # Applies to database
 pnpm db:studio    # Verify schema

 Type Definitions

 Update src/types/generation.ts:
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
   credits: number; // NEW: Current credits
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
   code: "INSUFFICIENT_CREDITS" | "UPLOAD_FAILED" | "AI_GENERATION_FAILED" | "DATABASE_ERROR" |
 "UNAUTHORIZED";
 }

 export type GenerateAvatarResult = GenerateAvatarSuccess | GenerateAvatarError;

 Server Action Implementation

 Create src/app/actions/generate-avatar.ts:

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
       return { success: false, error: "No image provided", code: "UPLOAD_FAILED" };
     }

     const buffer = Buffer.from(await file.arrayBuffer());

     // 4. Upload Original Image to Blob Storage
     const timestamp = Date.now();
     const originalFilename = `original_${userId}_${timestamp}_${file.name}`;
     const { url: originalImageUrl } = await upload(buffer, originalFilename, "avatars");

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
     await db.update(userTable)
       .set({ credits: userRecord.credits - 10 })
       .where(eq(userTable.id, userId));

     // 7. Call AI Generation (see AI Integration section for details)
     let generatedImageUrl: string;
     try {
       generatedImageUrl = await callOpenRouterImageGeneration(originalImageUrl);
     } catch (aiError) {
       // Mark as failed but DON'T refund credits
       await db.update(generationTable)
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
     await db.update(generationTable)
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

 // AI generation function - see AI Integration section
 async function callOpenRouterImageGeneration(referenceImageUrl: string): Promise<string> {
   // Implementation in AI Integration section
   throw new Error("See AI Integration section");
 }

 Key Design Decisions:
 - Credits deducted before AI call - Prevents abuse from infinite retries
 - Three-stage upload process - Original → AI generation → Re-upload generated (ensures permanent
 storage)
 - No credit refund on AI failure - Design choice to prevent abuse (can be changed)
 - Detailed error codes - Enables specific UI responses

 API Routes

 1. List Generations: src/app/api/generations/route.ts
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
   const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
   const status = searchParams.get("status") as "pending" | "completed" | "failed" | null;

   try {
     const where = status
       ? and(eq(generationTable.userId, session.user.id), eq(generationTable.status, status))
       : eq(generationTable.userId, session.user.id);

     const generations = await db.query.generation.findMany({
       where,
       orderBy: [desc(generationTable.createdAt)],
       limit,
     });

     return NextResponse.json({ generations, count: generations.length });
   } catch (error) {
     console.error("Failed to fetch generations:", error);
     return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
   }
 }

 2. User Stats: src/app/api/user/stats/route.ts
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
     return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
   }
 }

 3. Delete Generation: src/app/api/generations/[id]/route.ts
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
     return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
   }
 }

 Frontend Integration

 Dashboard Updates (src/app/dashboard/page.tsx):
 import { generateAvatar } from "@/app/actions/generate-avatar";
 import { Coins } from "lucide-react";

 // Add credits to state
 const [stats, setStats] = useState({
   totalGenerations: 0,
   credits: 30,
 });

 // Load stats from API
 const loadStats = async () => {
   try {
     const response = await fetch("/api/user/stats");
     if (response.ok) {
       const data = await response.json();
       setStats(data);
     }
   } catch (error) {
     console.error("Failed to load stats:", error);
   }
 };

 // Update handleGenerate
 const handleGenerate = async () => {
   if (!selectedFile || !session) return;

   // Client-side credit check for UX
   if (stats.credits < 10) {
     toast.error("Insufficient credits", {
       description: "You need 10 credits. Upgrade your plan to continue.",
       action: {
         label: "View Plans",
         onClick: () => window.location.href = "/pricing",
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
           action: { label: "View Plans", onClick: () => window.location.href = "/pricing" },
         });
       } else {
         toast.error("Generation Failed", { description: result.error });
       }
       return;
     }

     toast.success("Superhero transformation complete!", {
       description: `${result.remainingCredits} credits remaining`,
     });

     setStats(prev => ({
       ...prev,
       credits: result.remainingCredits,
       totalGenerations: prev.totalGenerations + 1,
     }));

     setSelectedFile(null);
     setPreviewUrl(null);
     await loadRecentGenerations();
   } catch (error) {
     console.error("Generation error:", error);
     toast.error("Failed to generate. Please try again.");
   } finally {
     setIsGenerating(false);
   }
 };

 // Add credits display
 <StatsCard
   label="Available Credits"
   value={stats.credits}
   icon={<Coins className="h-4 w-4" />}
   href="/pricing"
   description={stats.credits < 10 ? "Get more credits" : "Use for generations"}
 />

 // Update button
 <Button
   onClick={handleGenerate}
   disabled={!selectedFile || stats.credits < 10}
   className="w-full"
   size="lg"
 >
   <Zap className="mr-2 h-5 w-5" />
   Generate Superhero Avatar (10 credits)
 </Button>

 Gallery Updates (src/app/gallery/page.tsx):
 // Replace localStorage with API
 const loadGenerations = async () => {
   setIsLoading(true);
   try {
     const response = await fetch("/api/generations?status=completed");
     if (response.ok) {
       const data = await response.json();
       setGenerations(data.generations);
     }
   } catch (error) {
     console.error("Error loading generations:", error);
   } finally {
     setIsLoading(false);
   }
 };

 // Update delete to call API
 const handleDelete = async (id: string) => {
   try {
     const response = await fetch(`/api/generations/${id}`, {
       method: "DELETE",
     });

     if (response.ok) {
       loadGenerations();
     } else {
       toast.error("Failed to delete generation");
     }
   } catch (error) {
     console.error("Error deleting:", error);
     toast.error("Failed to delete generation");
   }
 };

 AI Integration: Gemini 2.5 Flash Image via OpenRouter

 Model Overview

 Model: google/gemini-2.5-flash-image (Nano Banana)
 Provider: OpenRouter
 Capabilities:
 - Image-to-image transformation with reference image support
 - Preserves aspect ratio by default
 - Conversational editing and multi-turn refinement
 - Targeted transformations (style changes, color adjustments, element modifications)

 Pricing: ~$0.039 per image (~1,290 tokens at $30/million tokens)

 Documentation:
 - OpenRouter Model Page
 - Image Generation Guide
 - Prompting Best Practices

 Implementation

 Add to src/app/actions/generate-avatar.ts:

 async function callOpenRouterImageGeneration(referenceImageUrl: string): Promise<string> {
   const apiKey = process.env.OPENROUTER_API_KEY;
   if (!apiKey) {
     throw new Error("OPENROUTER_API_KEY not configured");
   }

   const MODEL = "google/gemini-2.5-flash-image";

   // Detailed narrative prompt (not keyword list)
   const prompt = `Transform this person into an epic superhero character. Preserve their facial
 features and identity while adding:
 - A heroic costume with bold colors and iconic design elements
 - Dramatic cinematic lighting with strong contrast and depth
 - A powerful, confident pose that conveys strength and heroism
 - Dynamic background with energy effects or cityscape
 - Professional comic book or movie poster aesthetic

 Maintain the original aspect ratio. Create a stunning, photorealistic superhero transformation
 that stays true to the person's appearance.`;

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
     (item: any) => item.type === "image_url"
   )?.image_url?.url;

   if (!imageUrl) {
     throw new Error("No image URL in OpenRouter response");
   }

   return imageUrl;
 }

 Prompt Engineering Guidelines

 Best Practices:
 1. Use Narrative Descriptions - Not keyword lists. Describe what you want as a story.
 2. Be Explicit About Preservation - Specify "preserve facial features and identity"
 3. Specify Aspect Ratio - "Maintain the original aspect ratio" prevents distortion
 4. Detail Level - More details = better results (costume, lighting, pose, background)
 5. Quality Keywords - "photorealistic", "cinematic", "professional", "high-quality"

 Prompt Templates:

 Superhero Style (Current):
 Transform this person into an epic superhero character. Preserve their facial features and
 identity while adding:
 - A heroic costume with bold colors and iconic design elements
 - Dramatic cinematic lighting with strong contrast and depth
 - A powerful, confident pose that conveys strength and heroism
 - Dynamic background with energy effects or cityscape
 - Professional comic book or movie poster aesthetic

 Maintain the original aspect ratio. Create a stunning, photorealistic superhero transformation.

 Marvel-Inspired:
 Transform this person into a Marvel Cinematic Universe superhero. Keep their face recognizable
 while adding:
 - MCU-style tactical superhero suit with metallic accents
 - Studio lighting with blue/orange color grading
 - Heroic stance with slight lens flare effects
 - Urban or cosmic background
 - Cinematic movie poster quality

 Preserve facial features and maintain original aspect ratio.

 DC Comics Style:
 Transform this person into a DC Comics superhero. Preserve their identity while adding:
 - Classic DC superhero costume with cape and emblem
 - Dark, dramatic noir lighting with high contrast
 - Powerful heroic pose with determination in their expression
 - Gotham city or Metropolis backdrop
 - Comic book cover aesthetic with bold colors

 Keep facial features intact and maintain aspect ratio.

 Error Handling

 Common Errors:

 1. Invalid API Key
 if (!process.env.OPENROUTER_API_KEY) {
   throw new Error("OPENROUTER_API_KEY not configured");
 }

 2. API Rate Limits
 if (response.status === 429) {
   throw new Error("Rate limit exceeded. Please try again in a moment.");
 }

 3. Model Unavailable
 if (response.status === 503) {
   throw new Error("AI model temporarily unavailable. Please try again later.");
 }

 4. Invalid Image URL
 if (!referenceImageUrl || !referenceImageUrl.startsWith("http")) {
   throw new Error("Invalid reference image URL");
 }

 5. No Image in Response
 if (!imageUrl) {
   console.error("Full OpenRouter response:", JSON.stringify(data, null, 2));
   throw new Error("No image URL in OpenRouter response");
 }

 Response Format

 OpenRouter API Response Structure:
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

 Testing Checklist

 Unit Testing:
 - Verify API key validation
 - Test with valid reference image URL
 - Test with invalid/missing reference URL
 - Test error handling for 429, 503, 500 responses
 - Verify response parsing

 Integration Testing:
 - Upload test image → verify blob storage URL
 - Call OpenRouter with blob URL → verify generated image returned
 - Download generated image → verify valid image data
 - Re-upload to blob → verify final storage URL

 End-to-End Testing:
 - Complete flow: upload → generate → display
 - Verify credits deducted
 - Verify generation record in database
 - Test with various image types (portrait, full body, low light, etc.)
 - Verify error states display correctly

 Environment Variables

 Required:
 OPENROUTER_API_KEY=sk-or-v1-... # Get from https://openrouter.ai/settings/keys

 Verification:
 # Test OpenRouter connection
 curl https://openrouter.ai/api/v1/models \
   -H "Authorization: Bearer $OPENROUTER_API_KEY"

 Future Enhancements

 1. Style Selection - Let users choose transformation styles (Marvel, DC, anime, realistic)
 2. Prompt Customization - Allow users to specify costume colors, powers, background
 3. Multi-Model Support - Test other image generation models (DALL-E, Stable Diffusion)
 4. Batch Generation - Generate multiple variations at once
 5. Fine-Tuning - Custom model training on user's previous generations
 6. Progress Tracking - WebSocket or polling for real-time generation status

 ---
 Critical Files

 To Modify:

 1. src/lib/schema.ts - Add credits column, create generations table
 2. src/types/generation.ts - Update types to match new schema
 3. src/app/dashboard/page.tsx - Integrate server action, display credits
 4. src/app/gallery/page.tsx - Fetch from API instead of localStorage

 To Create:

 5. docs/technical/ai/avatar-generation-implementation.md - Comprehensive implementation
 documentation with research and detailed code examples
 6. src/app/actions/generate-avatar.ts - Main server action with AI generation logic
 7. src/app/api/generations/route.ts - List generations API
 8. src/app/api/user/stats/route.ts - User stats API
 9. src/app/api/generations/[id]/route.ts - Delete generation API

 To Reference (Existing Utilities):

 - src/lib/auth.ts - Use auth.api.getSession() for authentication
 - src/lib/storage.ts - Use upload() and deleteFile() for blob storage
 - src/lib/db.ts - Import db for database operations
 - src/app/api/chat/route.ts - Reference for auth pattern and OpenRouter usage

 ---
 Implementation Sequence

 0. Preserve Documentation (10 min)
   - Add comprehensive Avatar Generation implementation details to specs/Implementation.md
   - Add new sections after "Next Steps After Implementation":
       - Backend Integration: Avatar Generation System (detailed database schema, API routes,
 server actions)
     - AI Integration: Gemini 2.5 Flash Image (OpenRouter integration, prompts, error handling)
   - Include all research findings, code examples, and implementation patterns
   - This ensures we have the detailed context for future reference and reuse
 1. Database Setup (30 min)
   - Update src/lib/schema.ts with credits and generations table
   - Run pnpm db:generate to create migration
   - Run pnpm db:migrate to apply migration
   - Verify with pnpm db:studio
 2. Type Definitions (15 min)
   - Update src/types/generation.ts
   - Run pnpm typecheck to verify
 3. Server Action (2 hours)
   - Create src/app/actions/generate-avatar.ts
   - Implement all logic: auth, credits, upload, AI call, storage
   - Test with console.logs before full integration
 4. API Routes (1 hour)
   - Create generations list, stats, and delete routes
   - Test with curl or Postman
 5. Frontend - Dashboard (1.5 hours)
   - Update dashboard to call server action
   - Add credits display
   - Handle error cases with toasts
 6. Frontend - Gallery (1 hour)
   - Fetch from API instead of localStorage
   - Implement delete functionality
 7. Testing & Bug Fixes (1-2 hours)
   - Test full flow: upload → generate → view in gallery
   - Test edge cases: insufficient credits, upload errors, AI failures
   - Verify credits deduction works correctly
 8. Final Verification (30 min)
   - Run pnpm check (lint + typecheck)
   - Test on different browsers
   - Check blob storage for uploaded images

 Total Estimated Time: 6-8 hours

 ---
 Verification & Testing

 End-to-End Test Flow:

 1. Setup:
 pnpm db:migrate
 pnpm dev
   - Verify OPENROUTER_API_KEY is set in .env
   - Create test user account or login
 2. Happy Path Test:
   - Navigate to /dashboard
   - Verify credits display shows 30
   - Upload a clear portrait image (JPEG/PNG, <10MB)
   - Click "Generate Superhero Avatar (10 credits)"
   - Verify loading state appears
   - Wait for completion (~5-10 seconds)
   - Verify success toast with remaining credits (20)
   - Verify generated avatar appears in "Recent Transformations"
   - Navigate to /gallery
   - Verify generation appears
   - Verify credits display shows 20
 3. Insufficient Credits Test:
   - Use pnpm db:studio to manually set user credits to 5
   - Reload dashboard
   - Verify credits display shows 5
   - Verify generate button is disabled
   - Try clicking anyway (if enabled) - should show error toast
   - Verify toast has "View Plans" action button
 4. Delete Test:
   - In gallery, click delete on a generation
   - Verify generation removed from UI
   - Check database (db:studio) - record should be gone
   - Check blob storage - images should be deleted
 5. Error Handling Test:
   - Temporarily set invalid OPENROUTER_API_KEY in .env
   - Attempt generation
   - Verify error toast appears
   - Verify credits still deducted (10)
   - Check database - generation should have status="failed"
 6. Type Safety Test:
 pnpm check
   - Should pass with no errors

 Database Verification:

 pnpm db:studio

 Check:
 - user table has credits column with default 30
 - generation table exists with all columns
 - After test generation: verify record with correct userId, URLs, status
 - Foreign key constraint works (try deleting user → should cascade delete generations)

 Manual Code Review Checklist:

 - All imports use correct paths
 - Server action has "use server" directive
 - Auth checks in all protected routes
 - Credits deducted before AI call (not after)
 - Error messages are user-friendly
 - TypeScript strict mode compliance
 - No console.logs in production code
 - Blob storage uses existing upload() and deleteFile() functions
 - Database queries use proper Drizzle syntax with typed schema

 ---
 Notes & Considerations

 Design Decisions:

 1. Credits Deducted Before AI Call - Prevents abuse (users can't retry infinitely on failures).
 This is intentional and won't refund on AI errors.
 2. Three-Stage Upload - Original image uploaded first, then AI-generated image downloaded and
 re-uploaded. Ensures permanent storage in blob.
 3. No Real-Time Progress - Initial implementation uses simple loading state. Future enhancement:
 WebSocket or polling for progress updates.
 4. Fixed Prompt - Superhero transformation prompt is hardcoded. Future enhancement: Let users
 choose styles (Marvel, DC, anime, etc.).

 Environment Variables Required:

 OPENROUTER_API_KEY=sk-or-v1-... # Required for AI generation
 BLOB_READ_WRITE_TOKEN=vercel_blob_... # Optional, uses local storage if not set
 POSTGRES_URL=postgresql://... # Required for database

 Known Limitations:

 - No credit refund on AI failures
 - No batch generation (one at a time)
 - No style customization options
 - No generation history pagination (loads all)
 - No image compression (uploads as-is)

 Future Enhancements:

 - Integrate Polar payments for credit purchases
 - Add style options (Marvel, DC, anime, realistic)
 - Background job queue for generations
 - Email notifications on completion
 - Social sharing features
 - Public gallery with user consent

 ---
 Success Criteria

 ✅ Database:
 - User table has credits column (default 30)
 - Generations table created with proper indexes and foreign keys

 ✅ Server Action:
 - Authentication works
 - Credits validated and deducted correctly
 - Images uploaded to blob storage
 - OpenRouter API called successfully
 - Generated images stored permanently
 - Error handling works for all failure modes

 ✅ Frontend:
 - Dashboard shows current credits
 - Generate button disabled when credits < 10
 - Loading state during generation
 - Success/error toasts appear with appropriate messages
 - Gallery displays generations from database
 - Delete functionality works

 ✅ Type Safety:
 - pnpm check passes with no errors
 - All types align with database schema

 ✅ User Experience:
 - New users get 30 credits (3 free generations)
 - Clear messaging when credits run out
 - Generated avatars resemble original person
 - Fast response time (<15 seconds per generation)
 - Persistent storage across devices

