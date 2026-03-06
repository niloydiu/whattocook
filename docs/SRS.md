# Software Requirements Specification (SRS)

## WhatToCook — Bilingual Recipe Discovery Platform

**Version:** 2.0  
**Date:** March 2, 2026  
**Status:** Draft  
**References:** [BRD v2.0](./BRD.md)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Data Requirements](#5-data-requirements)
6. [External Interface Requirements](#6-external-interface-requirements)
7. [Traceability Matrix](#7-traceability-matrix)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification defines the detailed functional and non-functional requirements for WhatToCook v2.0. It serves as the contract between stakeholders and the development team, ensuring all parties agree on what will be built.

### 1.2 Scope
WhatToCook v2.0 covers improvements to the existing bilingual recipe discovery platform, focusing on:
- Reliable AI-powered recipe import from YouTube
- Intelligent ingredient deduplication
- Security hardening
- Missing UI features (cooking tracker)
- User engagement features (ratings, reviews)
- Performance optimization
- Complete bilingual experience

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|-----------|
| AI Pipeline | The automated flow: YouTube URL → transcript → Gemini AI → validated recipe |
| Dedup | Deduplication — identifying and merging duplicate database entries |
| ISR | Incremental Static Regeneration (Next.js page caching strategy) |
| JWT | JSON Web Token — industry-standard signed authentication token |
| Zod | TypeScript-first schema validation library |
| p95 | 95th percentile — 95% of requests complete within this time |
| EN | English language |
| BN | Bengali language |

### 1.4 References
- [BRD v2.0](./BRD.md) — Business Requirements Document
- [Design Document v2.0](./DESIGN.md) — Technical Design Document
- Prisma Schema: `prisma/schema.prisma`
- Current AI Prompt: `GEMINI_PROMPT_READY_TO_USE_V2.md`

---

## 2. System Overview

### 2.1 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js App Router)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  Public   │  │  User    │  │  Admin   │  │  Cooking      │   │
│  │  Pages    │  │  Pages   │  │  Panel   │  │  Tracker      │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘   │
│       │              │             │                │           │
│  ┌────┴──────────────┴─────────────┴────────────────┴───────┐   │
│  │              Shared Components & Hooks                    │   │
│  │  (RecipeCard, LanguageProvider, useActiveUser, etc.)       │   │
│  └──────────────────────────┬────────────────────────────────┘   │
├─────────────────────────────┼───────────────────────────────────┤
│                    MIDDLEWARE LAYER (NEW)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Auth     │  │ Rate     │  │ Zod      │  │ Error        │    │
│  │ (JWT)    │  │ Limiting │  │ Validate │  │ Handler      │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
├───────┼──────────────┼──────────────┼──────────────┼────────────┤
│                        API LAYER (Next.js Route Handlers)       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ /api/    │  │ /api/    │  │ /api/    │  │ /api/        │    │
│  │ recipes  │  │ admin    │  │ user     │  │ youtube      │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
├───────┼──────────────┼──────────────┼──────────────┼────────────┤
│                   SERVER ACTIONS (app/actions/)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ recipes  │  │ importer │  │ user     │  │ translate    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
├───────┼──────────────┼──────────────┼──────────────┼────────────┤
│                      DATA LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Prisma ORM   │  │ Supabase     │  │ Gemini AI            │   │
│  │ (PostgreSQL) │  │ (Auth)       │  │ (Recipe Extraction)  │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 16.x |
| UI | Tailwind CSS v4 + Framer Motion | 4.x |
| Language | TypeScript | 5.9 |
| ORM | Prisma | 5.22 |
| Database | PostgreSQL | 15+ |
| Auth (Users) | Supabase Auth | 2.x |
| Auth (Admin) | JWT (to be implemented) | — |
| AI | Google Gemini (Flash) | 2.0 |
| Validation | Zod (to be added) | 3.x |
| Search | Fuse.js (client) + PostgreSQL full-text (server) | — |
| Testing | Vitest + Playwright (to be added) | — |

---

## 3. Functional Requirements

### FR-1: AI-Powered Recipe Import Pipeline

**Maps to:** BR-1 (One-Click YouTube URL → Recipe Creation)  
**Priority:** P0 — Critical  
**Current State:** Unreliable; manual JSON editing required  
**Target File:** `app/actions/importer.ts`, `app/admin/import/page.tsx`

#### FR-1.1: YouTube URL Input & Video ID Extraction
- **Input:** Full YouTube URL (various formats) or 11-character video ID
- **Supported URL formats:**
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
  - `https://youtube.com/shorts/VIDEO_ID`
  - Raw 11-character ID: `dQw4w9WgXcQ`
- **Validation:** Extract video ID via regex; reject invalid formats with specific error
- **Duplicate Check:** Query DB for existing `youtube_id`; if found, show existing recipe with option to re-import

#### FR-1.2: Transcript Extraction
- **Primary:** Use `youtube-transcript` library to fetch auto/manual captions
- **Fallback 1:** If transcript unavailable, attempt to fetch video metadata (title, description, tags) via YouTube oEmbed API
- **Fallback 2:** If all fail, show error with manual entry option
- **Output:** Combined transcript text or video metadata for AI processing
- **Logging:** Log transcript source (auto-caption, manual, metadata fallback)

#### FR-1.3: AI Recipe Generation (Gemini)
- **Model:** `gemini-2.0-flash` (pinned version for reproducibility)
- **Input to AI:**
  - Transcript or video metadata
  - List of ALL existing ingredient `name_en` and `name_bn` from DB
  - Strict JSON schema with field descriptions
  - Rules for ingredient matching, translation, and categorization
- **Prompt Improvements:**
  - Use Gemini's structured output mode (`responseMimeType: "application/json"`)
  - Add explicit examples of correct ingredient matching
  - Add Bengali translation quality rules (natural phrasing, standard culinary terms)
  - Specify image URL format: `https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg`
- **Retry Logic:**
  - Attempt 1: Default temperature (0.7)
  - Attempt 2: Lower temperature (0.3) with "be more precise" addendum
  - Attempt 3: Minimal prompt with only essential fields
  - Between retries: ~2 second delay
- **Timeout:** 30 seconds per attempt; 90 seconds total

#### FR-1.4: Output Validation (Zod Schema)
```typescript
const RecipeImportSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title_en: z.string().min(3).max(200),
  title_bn: z.string().min(3).max(200),
  cuisine: z.string().min(2),
  category: z.string().min(2),
  foodCategory: z.enum(["Savory", "Sweet", "Spicy", "Sour", "Dessert", "Drinks", "Appetizer", "Soup", "Salad"]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  prep_time: z.number().int().min(0).max(1440),
  cook_time: z.number().int().min(1).max(1440),
  servings: z.number().int().min(1).max(100),
  image: z.string().url(),
  youtube_url: z.string().url(),
  youtube_id: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  ingredients: z.array(z.object({
    name_en: z.string().min(1),
    name_bn: z.string().min(1),
    quantity: z.string(),
    unit_en: z.string(),
    unit_bn: z.string(),
    notes_en: z.string().optional(),
    notes_bn: z.string().optional(),
  })).min(1),
  steps: z.array(z.object({
    step_number: z.number().int().min(1),
    instruction_en: z.string().min(5),
    instruction_bn: z.string().min(5),
    timestamp: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
  })).min(1),
  blog: z.object({
    intro_en: z.string().min(10),
    intro_bn: z.string().min(10),
    what_makes_it_special_en: z.string().min(10),
    what_makes_it_special_bn: z.string().min(10),
    cooking_tips_en: z.string().min(10),
    cooking_tips_bn: z.string().min(10),
    serving_en: z.string().min(10),
    serving_bn: z.string().min(10),
    storage_en: z.string().optional(),
    storage_bn: z.string().optional(),
    full_blog_en: z.string().min(50),
    full_blog_bn: z.string().min(50),
  }),
});
```
- **On validation failure:** Return specific field-level errors ("title_bn is too short", "foodCategory 'Spicy Food' is not a valid option, use 'Spicy'")
- **Auto-fix:** For common issues, auto-correct before validation (lowercase slug, trim whitespace, normalize foodCategory)

#### FR-1.5: Ingredient Resolution
- For each ingredient from AI output:
  1. Normalize name (see FR-2 for full algorithm)
  2. Search DB for match
  3. If exact match: use existing ingredient
  4. If fuzzy match (confidence > 80%): suggest existing ingredient with option to override
  5. If no match: mark as "new ingredient" and require admin confirmation
- Display all ingredient match decisions in the preview UI

#### FR-1.6: Admin Preview & Edit UI
- **Layout:** Multi-section form with tabs:
  - Tab 1: Basic Info (title, slug, cuisine, category, difficulty, times, servings)
  - Tab 2: Ingredients (table with match status, edit capability, quantity/unit)
  - Tab 3: Steps (reorderable list with EN/BN text and timestamps)
  - Tab 4: Blog Content (rich text editors for each section)
  - Tab 5: Media (image preview, YouTube embed preview)
- **Features:**
  - Side-by-side EN/BN fields for easy comparison
  - Real-time slug generation from English title
  - Ingredient match confidence badges (green=exact, yellow=fuzzy, red=new)
  - "Use existing" dropdown for fuzzy-matched ingredients
  - Preview of final recipe as it will appear to users
  - "Save as Draft" and "Publish" options
- **Validation:** Client-side Zod validation with inline error messages before allowing save

#### FR-1.7: Progress Indicator
- Visual pipeline stages:
  1. ⏳ Extracting video information...
  2. ⏳ Fetching transcript...
  3. ⏳ Generating recipe with AI (attempt 1/3)...
  4. ⏳ Validating recipe data...
  5. ⏳ Matching ingredients...
  6. ✅ Recipe ready for review!
- Each stage shows elapsed time
- Error at any stage shows specific error + retry button

---

### FR-2: Intelligent Ingredient Deduplication

**Maps to:** BR-2  
**Priority:** P0 — Critical  
**Current State:** Only exact/substring matching; widespread duplicates  
**Target Files:** `lib/findOrCreateIngredient.ts`, `app/admin/actions/createRecipe.ts`

#### FR-2.1: Ingredient Name Normalization Algorithm
```
Input: "Indian Mineral Water"

Step 1: Trim & lowercase
  → "indian mineral water"

Step 2: Strip common prefixes/modifiers
  Prefixes to remove: "indian", "organic", "fresh", "dried", "homemade",
    "pure", "raw", "natural", "local", "imported", "best quality",
    "premium", "traditional"
  → "mineral water"

Step 3: Singular normalization
  Rules: "tomatoes" → "tomato", "onions" → "onion", "potatoes" → "potato",
    "leaves" → "leaf", "cloves" → "clove"
  (Custom dictionary for food items, not generic English plurals)
  → "mineral water"

Step 4: Common synonym lookup
  Map: {"capsicum" → "bell pepper", "aubergine" → "eggplant",
    "coriander" → "cilantro", "prawns" → "shrimp"}
  → "mineral water" (no change)

Output: "mineral water"
```

#### FR-2.2: Multi-Layer Matching (in order)
| Layer | Method | Confidence | Example |
|-------|--------|-----------|---------|
| 1 | Exact match (normalized name_en, case-insensitive) | 100% | "Onion" matches "onion" |
| 2 | Exact match (name_bn) | 100% | "পেঁয়াজ" matches "পেঁয়াজ" |
| 3 | Synonym match (from `synonyms[]` field) | 95% | "capsicum" matches if "capsicum" is synonym of "Bell Pepper" |
| 4 | Phonetic match (existing `phonetic[]` field) | 85% | "peaj" matches "পেঁয়াজ" via phonetics |
| 5 | Fuzzy match (Levenshtein distance ≤ 2) | 70% | "tomatoe" matches "tomato" |
| 6 | Contains match (normalized, both directions) | 50% | "garlic" found in "garlic paste" — **flag for review, don't auto-match** |

#### FR-2.3: Match Decision Flow
```
For each ingredient:
  ├─ Match confidence ≥ 95% → Auto-use existing (show in preview as "matched")
  ├─ Match confidence 50-94% → Show suggestion to admin with comparison
  │   Admin chooses: [Use Existing] [Create New] [Merge & Add Synonym]
  └─ Match confidence < 50% → Treat as new ingredient
      Admin chooses: [Create New] [Search Manually]
```

#### FR-2.4: Admin Ingredient Merge Tool
- **Location:** Admin → Ingredients → "Merge Duplicates" tab
- **Feature:** Show list of potential duplicate pairs (detected by fuzzy matching)
- **Actions per pair:**
  - "Merge A into B" — reassign all RecipeIngredient references from A to B, delete A
  - "Keep Both" — mark as reviewed, don't suggest again
  - "Add Synonym" — keep B as canonical, add A's name to B's `synonyms[]`
- **Batch Merge:** Select multiple duplicates and merge into one canonical ingredient

#### FR-2.5: Ingredient Schema Changes
```prisma
model Ingredient {
  id        Int      @id @default(autoincrement())
  name_en   String
  name_bn   String
  img       String
  phonetic  String[]
  synonyms  String[]  // NEW: alternative names for dedup matching
  // ... existing fields
}
```

---

### FR-3: User Engagement Features

**Maps to:** BR-3  
**Priority:** P2 — Medium  

#### FR-3.1: Recipe Rating System
- **Schema:**
  ```prisma
  model Rating {
    id        Int      @id @default(autoincrement())
    userId    String
    recipeId  Int
    score     Int      // 1-5 stars
    review    String?  // Optional text review
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    recipe    Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
    @@unique([userId, recipeId])
  }
  ```
- **API:** `POST/PUT/DELETE /api/recipes/[slug]/ratings`
- **Display:** Star rating widget on recipe detail page; average + count on cards
- **Rules:** One rating per user per recipe; can update or delete

#### FR-3.2: Social Sharing
- **Share targets:** WhatsApp (with recipe summary), Facebook, Twitter/X, Copy Link
- **Share content:** Recipe title + image + URL + "Found on WhatToCook"
- **Implementation:** Web Share API (native) with fallback to custom share buttons
- **Location:** Recipe detail page + recipe cards (on hover/tap)

#### FR-3.3: Recipe Collections (Future - P3)
- Users can create named collections (e.g., "Weekend Meals", "Quick Lunches")
- Save recipes to collections
- Collections visible on user profile page

---

### FR-4: Cooking Tracker UI

**Maps to:** BR-4  
**Priority:** P1 — High  
**Current State:** Backend complete (`CookingProgress`, `CookingStepProgress`, `CookingIngredientProgress` models + server actions); **no frontend**  
**Target:** New page at `app/recipes/[slug]/cook/page.tsx`

#### FR-4.1: Cooking Mode Entry
- "Start Cooking" button on recipe detail page
- If existing in-progress session: show "Resume Cooking" with progress indicator
- Navigates to `/recipes/[slug]/cook`

#### FR-4.2: Cooking Mode Layout
```
┌─────────────────────────────────────────────────┐
│  [← Back]    Recipe Title      [Step 3 of 8]    │
│                                                  │
│  ┌─────────────────────────────────────────┐     │
│  │                                         │     │
│  │        Step Instruction (Large Text)     │     │
│  │        "Add the onions to the pan        │     │
│  │         and sauté until golden brown"    │     │
│  │                                         │     │
│  │   ⏱️ Timer: [5:00]  [Start Timer]       │     │
│  │                                         │     │
│  │   📹 [Watch this step] (jumps to video) │     │
│  │                                         │     │
│  └─────────────────────────────────────────┘     │
│                                                  │
│  ┌──────────────────────────────────────┐        │
│  │  Ingredients for this step:          │        │
│  │  ☑️ 2 medium onions, sliced          │        │
│  │  ☐ 1 tbsp oil                        │        │
│  └──────────────────────────────────────┘        │
│                                                  │
│  [◀ Previous]        [✓ Done]      [Next ▶]      │
│                                                  │
│  Progress: ████████░░░░░░░ 37%                   │
└─────────────────────────────────────────────────┘
```

#### FR-4.3: Features
| Feature | Requirement |
|---------|------------|
| Step navigation | Previous/Next buttons; step number indicator; swipe gestures on mobile |
| Step completion | "Done" button marks step complete; checkbox persisted via API |
| Ingredient checklist | Toggle "I have this" for each ingredient; save state via API |
| Timer | Per-step countdown timer with audio notification on completion |
| Video sync | Click "Watch this step" → opens YouTube at step's timestamp |
| Progress bar | Visual bar showing % of steps completed |
| Resume | On re-visit, show last incomplete step |
| Bilingual | All text switchable between EN/BN |
| Large UI | Minimum 18px font; large tap targets (56px+); high contrast |
| Keep screen awake | Use Wake Lock API to prevent screen dimming while cooking |

#### FR-4.4: API Endpoints
- `POST /api/user/cooking/start` — Create CookingProgress session
- `PUT /api/user/cooking/step` — Update step completion
- `PUT /api/user/cooking/ingredient` — Update ingredient availability
- `POST /api/user/cooking/finish` — Mark cooking complete
- `GET /api/user/cooking/[recipeId]` — Get current progress

---

### FR-5: Recipe Search & Discovery

**Maps to:** BR-5  
**Priority:** P1 — High  
**Current State:** Loads ALL recipes into memory for ingredient search  
**Target Files:** `app/api/recipes/search-by-ingredients/route.ts`, `app/api/recipes/route.ts`

#### FR-5.1: Server-Side Ingredient Search
**Current (broken):**
```typescript
// Loads ALL recipes into memory, then filters in JavaScript
const recipes = await prisma.recipe.findMany({
  include: { ingredients: { include: { ingredient: true } }, steps: true }
});
// Then iterates and scores in-memory
```

**Target:**
```typescript
// Step 1: Find ingredient IDs matching user input
const matchedIngredientIds = await prisma.ingredient.findMany({
  where: {
    OR: normalizedInputs.map(name => ({
      OR: [
        { name_en: { contains: name, mode: "insensitive" } },
        { name_bn: { contains: name } },
        { synonyms: { has: name } },
        { phonetic: { has: name } },
      ]
    }))
  },
  select: { id: true }
});

// Step 2: Find recipes containing these ingredients (database-level)
const recipes = await prisma.recipe.findMany({
  where: {
    ingredients: {
      some: {
        ingredient_id: { in: matchedIngredientIds.map(i => i.id) }
      }
    }
  },
  include: { ingredients: { include: { ingredient: true } } },
  take: 50, // Pagination
});

// Step 3: Score in application (only for matched recipes, not ALL)
```

#### FR-5.2: Full-Text Search
- **Implementation:** PostgreSQL `tsvector` for title and ingredient name search
- **Fields indexed:** `title_en`, `title_bn`, `ingredient.name_en`, `ingredient.name_bn`
- **Query:** `plainto_tsquery` for user input
- **Ranking:** `ts_rank` for relevance scoring
- **Fallback:** `ILIKE` search if full-text returns no results

#### FR-5.3: Advanced Filters
| Filter | Type | Values |
|--------|------|--------|
| Cuisine | Multi-select | Dynamic from DB (Indian, Chinese, Bengali, etc.) |
| Food Category | Multi-select | Savory, Sweet, Spicy, Sour, Dessert, Drinks, Appetizer, Soup, Salad |
| Difficulty | Single-select | Easy, Medium, Hard |
| Prep Time | Range slider | 0–120 min |
| Cook Time | Range slider | 0–240 min |
| Servings | Range | 1–20+ |
| Dietary | Checkboxes | Exclude user's allergens |

- All filters encode in URL query parameters: `?cuisine=Indian&difficulty=Easy&maxCookTime=30`
- Filter state shareable via URL

#### FR-5.4: Search Autocomplete
- **Endpoint:** `GET /api/recipes/autocomplete?q=butter`
- **Returns:** Max 8 suggestions with types:
  - Recipe titles matching query (max 5)
  - Ingredient names matching query (max 3)
- **Performance:** Response in < 200ms
- **Debounce:** Client debounces input by 300ms

#### FR-5.5: Similar Recipes
- **On recipe detail page:** Show 4-6 recipes with same `cuisine` + `foodCategory`
- **Exclude:** Current recipe
- **Sort:** By rating (when available), then by creation date
- **Fallback:** If < 4 similar, expand to same `cuisine` only

#### FR-5.6: Allergy-Aware Search
- If user is logged in and has allergies:
  - Search results exclude recipes containing allergen ingredients
  - Show "X recipes hidden due to your allergies" message
  - Toggle to show all (with allergen warnings)

---

### FR-6: Internationalization (i18n)

**Maps to:** BR-6  
**Priority:** P2 — Medium  
**Current State:** ~80% bilingual; some hardcoded English  

#### FR-6.1: Language File System
- **Structure:**
  ```
  locales/
    en.json    // All English UI strings
    bn.json    // All Bengali UI strings
  ```
- **Usage:** `const t = useTranslation()` hook → `t('recipe.addToFavorites')`
- **Keys organized by feature:**
  ```json
  {
    "nav": { "home": "Home", "recipes": "Recipes", ... },
    "recipe": { "ingredients": "Ingredients", "steps": "Steps", ... },
    "cooking": { "startCooking": "Start Cooking", ... },
    "report": { "title": "Report Recipe", "reason": "Reason", ... },
    "error": { "notFound": "Not Found", ... },
    "empty": { "noRecipes": "No recipes found", ... }
  }
  ```

#### FR-6.2: Language Persistence
- **Priority order:**
  1. URL parameter `?lang=bn` (highest)
  2. User profile preference (if logged in)
  3. `localStorage` value
  4. Browser `navigator.language` detection
  5. Default: `en`

#### FR-6.3: Components to Fix
| Component | Issue | Fix |
|-----------|-------|-----|
| `ReportModal.tsx` | All strings hardcoded English | Use `t()` hook for all strings |
| `AlertModal.tsx` | Button text hardcoded | Use `t()` hook |
| `ConfirmModal.tsx` | Button text hardcoded | Use `t()` hook |
| Admin panel pages | Mostly English-only | Add bilingual support |
| Error messages | English-only in API responses | Return localized error messages |

---

### FR-7: Recipe Request → Approval Workflow

**Maps to:** BR-7  
**Priority:** P1 — High  
**Current State:** Requests stored but never converted to recipes  
**Target File:** `app/admin/recipe-requests/page.tsx`

#### FR-7.1: Approval Actions
| Request Type | Admin Action | System Behavior |
|-------------|-------------|-----------------|
| `submit` (full recipe) | "Approve & Create Recipe" | Pre-fill recipe creation form with submitted data → admin reviews → save |
| `by-name` (with YouTube URL) | "Import from YouTube" | Trigger AI pipeline (FR-1) with the submitted URL |
| `by-name` (name only) | "Search YouTube" | Open YouTube search in new tab with recipe name |
| `by-ingredients` | "Generate Recipe Idea" | Send ingredient list to AI for recipe suggestion |

#### FR-7.2: Request Status Flow
```
pending → approved → published (linked to recipe)
pending → rejected (with admin notes)
```

#### FR-7.3: Link Back
- Approved + published requests store the created `recipe_id`
- Request detail shows link to the published recipe

---

### FR-8: Admin Enhancements

**Maps to:** BR-10  
**Priority:** P2 — Medium  

#### FR-8.1: Ingredient Merge Tool
- **Location:** Admin → Ingredients → "Find Duplicates" button
- **Detection:** Run pairwise Levenshtein + prefix-stripped comparison across all ingredients
- **Display:** List of potential duplicate pairs with confidence scores
- **Actions:** Merge (reassign recipe links + delete duplicate) or Dismiss
- **Safety:** Show affected recipe count before merge

#### FR-8.2: Audit Log
- **Schema:**
  ```prisma
  model AuditLog {
    id        Int      @id @default(autoincrement())
    adminId   Int
    action    String   // "recipe.create", "recipe.delete", "ingredient.merge", etc.
    entityType String  // "Recipe", "Ingredient", "RecipeRequest", etc.
    entityId  Int?
    details   Json?    // Before/after snapshot for updates
    createdAt DateTime @default(now())
    admin     Admin    @relation(fields: [adminId], references: [id])
    @@index([adminId])
    @@index([action])
    @@index([createdAt])
  }
  ```
- **Logged actions:** Create, update, delete for recipes and ingredients; approve/reject requests; merge ingredients; login/logout

#### FR-8.3: Enhanced Dashboard Stats
```
Current:                        Add:
- Total recipes                - Recipes added this week
- Total ingredients            - Pending requests count
- Total cuisines               - Open reports count
                               - Ingredients without images
                               - Potential duplicate ingredients
                               - Most favorited recipes (top 5)
```

---

## 4. Non-Functional Requirements

### NFR-1: Security

| ID | Requirement | Implementation |
|----|------------|---------------|
| NFR-1.1 | Admin auth uses signed JWT tokens | Replace Base64 encoding with `jsonwebtoken` HS256 signing using `process.env.JWT_SECRET` |
| NFR-1.2 | JWT expiry: 24 hours with refresh capability | Include `exp` claim; refresh endpoint extends session |
| NFR-1.3 | All API inputs validated with Zod schemas | Every POST/PUT/DELETE handler validates `request.json()` against schema before processing |
| NFR-1.4 | Rate limiting on public APIs | 100 requests/minute per IP on search endpoints; 10/minute on AI endpoints |
| NFR-1.5 | CSRF protection | Use `SameSite=Strict` cookies for admin auth; or double-submit cookie pattern |
| NFR-1.6 | Input sanitization | Strip HTML tags from user-submitted text (reviews, reports, requests) |
| NFR-1.7 | No secrets in client bundle | All API keys exclusively in server-side code; validated via `process.env` check at startup |
| NFR-1.8 | Audit trail for admin actions | See FR-8.2 |

### NFR-2: Performance

| ID | Requirement | Metric |
|----|------------|--------|
| NFR-2.1 | Page load time (First Contentful Paint) | < 1.5 seconds on 4G |
| NFR-2.2 | API response time (p95) | < 500ms for list endpoints |
| NFR-2.3 | Ingredient search response | < 500ms for 10k recipes |
| NFR-2.4 | Recipe detail page | Use ISR with 60-second revalidation |
| NFR-2.5 | Image loading | All images lazy-loaded; Next.js `<Image>` with proper sizing |
| NFR-2.6 | Client bundle size | < 300KB initial JavaScript (gzipped) |
| NFR-2.7 | Database queries | All frequent queries use indexed columns; no full-table scans for search |

### NFR-3: Reliability

| ID | Requirement |
|----|------------|
| NFR-3.1 | Error boundary components prevent full-page crashes (per major section) |
| NFR-3.2 | AI pipeline failures degrade gracefully (show error, allow manual entry) |
| NFR-3.3 | Database transaction for recipe creation (atomic ingredients + steps + blog) |
| NFR-3.4 | Graceful degradation when Supabase Auth is unavailable (dev mode) |

### NFR-4: Accessibility

| ID | Requirement |
|----|------------|
| NFR-4.1 | WCAG 2.1 AA compliance for all public pages |
| NFR-4.2 | All interactive elements keyboard-navigable |
| NFR-4.3 | Color contrast ratio ≥ 4.5:1 for text |
| NFR-4.4 | All images have descriptive alt text |
| NFR-4.5 | Screen reader compatible navigation |
| NFR-4.6 | Focus management for modals and dynamic content |

### NFR-5: Testing

| ID | Requirement | Tool |
|----|------------|------|
| NFR-5.1 | Unit tests for validation schemas, normalization, and matching | Vitest |
| NFR-5.2 | Integration tests for API routes | Vitest + supertest |
| NFR-5.3 | Component tests for critical UI flows | Vitest + React Testing Library |
| NFR-5.4 | E2E tests for recipe creation, search, and cooking tracker | Playwright |
| NFR-5.5 | Code coverage ≥ 60% for critical paths | Vitest coverage |
| NFR-5.6 | Tests run in CI pipeline (GitHub Actions) | Extend `ci.yml` |

### NFR-6: Scalability

| ID | Requirement |
|----|------------|
| NFR-6.1 | System handles 10,000+ recipes without performance degradation |
| NFR-6.2 | System handles 1,000 concurrent users |
| NFR-6.3 | Database queries remain < 500ms with 10k recipes and 5k ingredients |
| NFR-6.4 | API endpoints paginated by default (max 50 items per page) |

### NFR-7: Monitoring & Observability

| ID | Requirement |
|----|------------|
| NFR-7.1 | Structured logging (JSON format) for all API errors |
| NFR-7.2 | Health check endpoint: `GET /api/health` |
| NFR-7.3 | Startup validation of required environment variables |
| NFR-7.4 | AI pipeline logs (prompt tokens, response tokens, latency, success/failure) |

---

## 5. Data Requirements

### 5.1 Schema Changes Summary

| Model | Change | Reason |
|-------|--------|--------|
| `Ingredient` | Add `synonyms String[]` | Deduplication matching (FR-2) |
| New: `Rating` | `userId, recipeId, score, review` | User ratings/reviews (FR-3) |
| New: `AuditLog` | `adminId, action, entityType, entityId, details` | Admin audit trail (FR-8) |
| `RecipeRequest` | Add `linkedRecipeId Int?` | Link approved requests to created recipes (FR-7) |
| `Recipe` | Add `viewCount Int @default(0)` | Analytics (FR-8) |

### 5.2 Data Migration
- **Existing ingredients:** Run dedup algorithm on current data to identify and merge duplicates
- **Existing recipes:** No data changes; schema is additive only
- **Backward compatible:** All changes are additions; no existing column removal

### 5.3 Index Requirements
| Table | Column(s) | Type | Reason |
|-------|-----------|------|--------|
| `Ingredient` | `name_en` | B-tree (case-insensitive) | Fast lookup during dedup |
| `Ingredient` | `synonyms` | GIN | Array contains search |
| `Recipe` | `title_en, title_bn` | GIN (tsvector) | Full-text search |
| `Rating` | `recipeId` | B-tree | Aggregate queries |
| `AuditLog` | `createdAt` | B-tree | Chronological queries |

---

## 6. External Interface Requirements

### 6.1 Google Gemini API
- **Endpoint:** generativelanguage.googleapis.com
- **Auth:** API key via `GEMINI_API_KEY` env var
- **Model:** `gemini-2.0-flash`
- **Rate limit:** Respect free tier (15 RPM, 1M TPM)
- **Error handling:** Timeout after 30s; retry up to 3 times with backoff
- **Response format:** `application/json` (structured output mode)

### 6.2 YouTube Transcript API
- **Library:** `youtube-transcript`
- **Input:** YouTube video ID
- **Output:** Array of `{ text, duration, offset }` segments
- **Fallback:** YouTube oEmbed for title/description if transcript unavailable
- **Rate limit:** No explicit limit; batch delay of 1s between imports

### 6.3 Supabase Auth
- **Services used:** Authentication (OAuth), User management
- **Providers:** Google OAuth (primary)
- **Client:** Browser client for auth state; server admin client for user queries
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6.4 PostgreSQL Database
- **Provider:** Local development DB or Supabase PostgreSQL
- **Access:** Via Prisma ORM exclusively
- **Env var:** `DATABASE_URL`
- **Requirements:** PostgreSQL 15+ for full-text search features

---

## 7. Traceability Matrix

| Business Req | Functional Req | Non-Functional Req | Design Section |
|-------------|---------------|-------------------|----------------|
| BR-1 (YouTube→Recipe) | FR-1.1–FR-1.7 | NFR-3.2, NFR-7.4 | DS-3 (AI Pipeline) |
| BR-2 (Ingredient Dedup) | FR-2.1–FR-2.5 | NFR-2.7 | DS-4 (Ingredient Resolution) |
| BR-3 (User Engagement) | FR-3.1–FR-3.3 | NFR-4.1 | DS-5 (Rating System) |
| BR-4 (Cooking Tracker) | FR-4.1–FR-4.4 | NFR-4.2 | DS-6 (Cooking Tracker) |
| BR-5 (Search & Discovery) | FR-5.1–FR-5.6 | NFR-2.3, NFR-6.3 | DS-7 (Search Architecture) |
| BR-6 (Bilingual) | FR-6.1–FR-6.3 | NFR-4.4 | DS-8 (i18n System) |
| BR-7 (Request Workflow) | FR-7.1–FR-7.3 | — | DS-9 (Request Pipeline) |
| BR-8 (Mobile-First) | — | NFR-2.1, NFR-4.1 | DS-10 (Responsive Design) |
| BR-9 (Security) | — | NFR-1.1–NFR-1.8 | DS-11 (Security Layer) |
| BR-10 (Admin Analytics) | FR-8.1–FR-8.3 | NFR-7.1 | DS-12 (Admin Dashboard) |
