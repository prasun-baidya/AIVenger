# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Agentic Coding Boilerplate - AI Assistant Guidelines

## Project Overview

This is a Next.js 16 boilerplate for building AI-powered applications with authentication, database, and modern UI components.

### Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript
- **AI Integration**: Vercel AI SDK 5 + OpenRouter (access to 100+ AI models)
- **Authentication**: BetterAuth with Email/Password
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui components with Tailwind CSS 4
- **Styling**: Tailwind CSS with dark mode support (next-themes)

## AI Integration with OpenRouter

### Key Points

- This project uses **OpenRouter** as the AI provider, NOT direct OpenAI
- OpenRouter provides access to 100+ AI models through a single unified API
- Default model: `openai/gpt-5-mini` (configurable via `OPENROUTER_MODEL` env var)
- Users browse models at: https://openrouter.ai/models
- Users get API keys from: https://openrouter.ai/settings/keys

### AI Implementation Files

- `src/app/api/chat/route.ts` - Chat API endpoint using OpenRouter
- Package: `@openrouter/ai-sdk-provider` (not `@ai-sdk/openai`)
- Import: `import { openrouter } from "@openrouter/ai-sdk-provider"`

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth route group
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   ├── forgot-password/     # Forgot password page
│   │   └── reset-password/      # Reset password page
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth catch-all route
│   │   ├── chat/route.ts        # AI chat endpoint (OpenRouter)
│   │   └── diagnostics/         # System diagnostics
│   ├── chat/page.tsx            # AI chat interface (protected)
│   ├── dashboard/page.tsx       # User dashboard (protected)
│   ├── profile/page.tsx         # User profile (protected)
│   ├── page.tsx                 # Home/landing page
│   └── layout.tsx               # Root layout
├── components/
│   ├── auth/                    # Authentication components
│   │   ├── sign-in-button.tsx   # Sign in form
│   │   ├── sign-up-form.tsx     # Sign up form
│   │   ├── forgot-password-form.tsx
│   │   ├── reset-password-form.tsx
│   │   ├── sign-out-button.tsx
│   │   └── user-profile.tsx
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── separator.tsx
│   │   ├── mode-toggle.tsx      # Dark/light mode toggle
│   │   └── github-stars.tsx
│   ├── site-header.tsx          # Main navigation header
│   ├── site-footer.tsx          # Footer component
│   ├── theme-provider.tsx       # Dark mode provider
│   ├── setup-checklist.tsx      # Setup guide component
│   └── starter-prompt-modal.tsx # Starter prompts modal
└── lib/
    ├── auth.ts                  # Better Auth server config
    ├── auth-client.ts           # Better Auth client hooks
    ├── db.ts                    # Database connection
    ├── schema.ts                # Drizzle schema (users, sessions, etc.)
    ├── session.ts               # Session management utilities
    ├── storage.ts               # File storage abstraction (Vercel Blob / local)
    ├── env.ts                   # Environment variable validation
    └── utils.ts                 # Utility functions (cn, etc.)
```

## Environment Variables

Required environment variables (see `env.example`):

```env
# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/db_name

# Better Auth
BETTER_AUTH_SECRET=32-char-random-string

# AI via OpenRouter
OPENROUTER_API_KEY=sk-or-v1-your-key
OPENROUTER_MODEL=openai/gpt-5-mini  # or any model from openrouter.ai/models

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# File Storage (optional)
BLOB_READ_WRITE_TOKEN=  # Leave empty for local dev, set for Vercel Blob in production
```

## Available Scripts

**Note**: This project uses `pnpm` as the package manager. Use `pnpm` instead of `npm` when running scripts.

```bash
pnpm dev          # Start dev server (DON'T run this yourself - ask user)
pnpm build        # Build for production (runs db:migrate first)
pnpm build:ci     # Build without database (for CI/CD pipelines)
pnpm start        # Start production server
pnpm lint         # Run ESLint (ALWAYS run after changes)
pnpm typecheck    # TypeScript type checking (ALWAYS run after changes)
pnpm check        # Run both lint and typecheck (RECOMMENDED after changes)
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
pnpm db:generate  # Generate database migrations
pnpm db:migrate   # Run database migrations
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open Drizzle Studio (database GUI)
pnpm db:dev       # Push schema for development
pnpm db:reset     # Reset database (drop all tables)
```

## Claude Code Skills

This project includes custom Claude Code skills in `.claude/commands/`:

- `/create-spec` - Create a new feature specification with requirements and implementation plan
- `/publish-to-github` - Publish a feature specification to GitHub Issues and Projects
- `/continue-feature` - Continue implementing the next task for a GitHub-published feature
- `/checkpoint` - Create a commit with detailed comment
- `/review-pr` - Review pull requests

See README.md for detailed workflow documentation on using these skills.

## Documentation Files

The project includes technical documentation in `docs/`:

- `docs/technical/ai/streaming.md` - AI streaming implementation guide
- `docs/technical/ai/structured-data.md` - Structured data extraction
- `docs/technical/react-markdown.md` - Markdown rendering guide
- `docs/technical/betterauth/polar.md` - Polar payment integration
- `docs/business/starter-prompt.md` - Business context for AI prompts

## Guidelines for AI Assistants

### CRITICAL RULES

1. **ALWAYS run lint and typecheck** after completing changes:

   ```bash
   pnpm check
   # or separately:
   pnpm lint && pnpm typecheck
   ```

2. **NEVER start the dev server yourself**

   - If you need dev server output, ask the user to provide it
   - Don't run `pnpm dev` or `npm run dev`

3. **Use OpenRouter, NOT OpenAI directly**

   - Import from `@openrouter/ai-sdk-provider`
   - Use `openrouter()` function, not `openai()`
   - Model names follow OpenRouter format: `provider/model-name`

4. **Styling Guidelines**

   - Stick to standard Tailwind CSS utility classes
   - Use shadcn/ui color tokens (e.g., `bg-background`, `text-foreground`)
   - Avoid custom colors unless explicitly requested
   - Support dark mode with appropriate Tailwind classes

5. **Authentication**

   - Server-side: Import from `@/lib/auth` (Better Auth instance)
   - Client-side: Import hooks from `@/lib/auth-client`
   - Protected routes should check session in Server Components
   - Use existing auth components from `src/components/auth/`

6. **Database Operations**

   - Use Drizzle ORM (imported from `@/lib/db`)
   - Schema is defined in `@/lib/schema`
   - Always run migrations after schema changes
   - PostgreSQL is the database (not SQLite, MySQL, etc.)

7. **File Storage**

   - Use the storage abstraction from `@/lib/storage`
   - Automatically uses local storage (dev) or Vercel Blob (production)
   - Import: `import { upload, deleteFile } from "@/lib/storage"`
   - Example: `const result = await upload(buffer, "avatar.png", "avatars")`
   - Storage switches based on `BLOB_READ_WRITE_TOKEN` environment variable

8. **Component Creation**

   - Use existing shadcn/ui components when possible
   - Follow the established patterns in `src/components/ui/`
   - Support both light and dark modes
   - Use TypeScript with proper types

9. **TypeScript**

   - This project uses **very strict TypeScript configuration**
   - All strict mode flags are enabled (strictNullChecks, noImplicitAny, etc.)
   - Additional strict checks: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`
   - Always handle potential undefined/null cases when accessing arrays or optional properties
   - Environment variables are validated via `src/lib/env.ts`

10. **API Routes**
    - Follow Next.js 16 App Router conventions
    - Use Route Handlers (route.ts files)
    - Return Response objects
    - Handle errors appropriately

### Best Practices

- Read existing code patterns before creating new features
- Maintain consistency with established file structure
- Use the documentation files when implementing related features
- Test changes with lint and typecheck before considering complete
- When modifying AI functionality, refer to `docs/technical/ai/` guides

### Common Tasks

**Adding a new page:**

1. Create in `src/app/[route]/page.tsx`
2. Use Server Components by default
3. Add to navigation if needed

**Adding a new API route:**

1. Create in `src/app/api/[route]/route.ts`
2. Export HTTP method handlers (GET, POST, etc.)
3. Use proper TypeScript types

**Adding authentication to a page:**

1. Import auth instance: `import { auth } from "@/lib/auth"`
2. Get session: `const session = await auth.api.getSession({ headers: await headers() })`
3. Check session and redirect if needed

**Working with the database:**

1. Update schema in `src/lib/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`
4. Import `db` from `@/lib/db` to query

**Modifying AI chat:**

1. Backend: `src/app/api/chat/route.ts`
2. Frontend: `src/app/chat/page.tsx`
3. Reference streaming docs: `docs/technical/ai/streaming.md`
4. Remember to use OpenRouter, not direct OpenAI

**Working with file storage:**

1. Import storage functions: `import { upload, deleteFile } from "@/lib/storage"`
2. Upload files: `const result = await upload(fileBuffer, "filename.png", "folder")`
3. Delete files: `await deleteFile(result.url)`
4. Storage automatically uses local filesystem in dev, Vercel Blob in production
5. Local files are saved to `public/uploads/` and served at `/uploads/`
