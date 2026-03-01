# Business Requirements Document (BRD)

## WhatToCook — Bilingual Recipe Discovery Platform

**Version:** 2.0  
**Date:** March 2, 2026  
**Status:** Draft  
**Author:** Engineering Team  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [Stakeholders](#3-stakeholders)
4. [Current State Analysis](#4-current-state-analysis)
5. [Business Requirements](#5-business-requirements)
6. [Success Metrics](#6-success-metrics)
7. [Constraints & Assumptions](#7-constraints--assumptions)
8. [Out of Scope](#8-out-of-scope)
9. [Priority Matrix](#9-priority-matrix)
10. [Glossary](#10-glossary)

---

## 1. Executive Summary

**WhatToCook** is a bilingual (English/Bengali) recipe discovery platform that enables users to find recipes by ingredients they have on hand, explore curated recipe collections, track their cooking progress, and manage dietary preferences. Administrators can curate recipes by importing them from YouTube cooking videos using AI-powered extraction.

### Current State

The platform is functional with core features in place: recipe browsing, ingredient-based search, user favorites/wishlist/allergies, admin recipe management, AI-powered chatbot, and recipe request system. However, several critical issues prevent the platform from reaching its potential:

- **The AI recipe import pipeline is unreliable** — Gemini frequently produces incorrect translations, wrong ingredients, or malformed JSON that fails to parse. Admins must manually create recipe JSON files instead of simply pasting a YouTube URL.
- **Duplicate ingredients proliferate** — The system creates separate database entries for semantically identical ingredients (e.g., "Indian mineral water" vs. "mineral water", "Onion" vs. "onions" vs. "Yellow Onion") because matching relies on exact/substring text comparison.
- **Admin authentication is insecure** — Tokens are Base64-encoded plaintext (not cryptographically signed), making them trivially forgeable.
- **Built features lack UI** — The cooking tracker has complete backend support but no frontend interface.
- **User experience gaps** — No loading skeletons, inconsistent bilingual support, 4 redundant recipe card components, no recipe ratings or reviews.

### Vision

Transform WhatToCook into the **best bilingual recipe platform** where:
- An admin can paste a YouTube URL and get a **fully validated, correctly translated recipe** in under 30 seconds with a single click.
- Users discover recipes intuitively through **smart ingredient matching, personalized recommendations, and social features**.
- Every interaction is **polished, responsive, and fully bilingual** (EN/BN).
- The system is **secure, performant, and tested**.

---

## 2. Business Objectives

| ID | Objective | Rationale |
|----|-----------|-----------|
| BO-1 | Reduce recipe creation time from ~15 minutes (manual JSON) to < 1 minute (paste URL) | Admin productivity is the bottleneck for content growth |
| BO-2 | Eliminate duplicate ingredients in the database | Data quality directly impacts search accuracy and user trust |
| BO-3 | Increase user engagement and retention | Ratings, reviews, cooking tracker drive repeat visits |
| BO-4 | Deliver consistent bilingual (EN/BN) experience | Core differentiator; Bengali-speaking audience is primary target |
| BO-5 | Ensure platform security and data integrity | Protect admin operations and user data |
| BO-6 | Achieve sub-2-second page loads across all pages | Performance directly affects user retention |
| BO-7 | Enable community-driven recipe growth | Recipe requests → approved recipes closes the content loop |
| BO-8 | Provide professional-grade cooking assistance | Cooking tracker, timers, video sync elevate beyond a recipe list |

---

## 3. Stakeholders

### 3.1 Primary Stakeholders

| Stakeholder | Role | Needs |
|-------------|------|-------|
| **Admin / Recipe Curator** | Creates and manages recipes, ingredients, and user requests | Fast, reliable recipe import from YouTube; ingredient management tools; clear dashboard |
| **End User (Home Cook)** | Discovers, saves, and cooks recipes | Intuitive search by ingredients; step-by-step cooking guide; bilingual content; dietary management |

### 3.2 Secondary Stakeholders

| Stakeholder | Role | Needs |
|-------------|------|-------|
| **Recipe Requester** | Submits recipe ideas or YouTube links for admin review | Clear submission flow; status visibility; notification on approval |
| **AI System (Gemini)** | Extracts recipe data from YouTube transcripts | Well-structured prompts; validation feedback loop; clear ingredient matching rules |

### 3.3 User Personas

#### Persona 1: Rima (Bengali Home Cook)
- **Age:** 28 | **Location:** Dhaka, Bangladesh
- **Tech Comfort:** Moderate (smartphone-primary)
- **Goals:** Find recipes using ingredients she already has; follow along step-by-step while cooking; save favorites for later
- **Pain Points:** English-only recipe sites; hard to gauge if she has enough ingredients; loses her place while cooking
- **Language Preference:** Bengali (primary), English (secondary)

#### Persona 2: Niloy (Admin / Content Curator)  
- **Age:** 25 | **Location:** Bangladesh
- **Tech Comfort:** High (developer background)
- **Goals:** Rapidly grow the recipe database from YouTube videos; maintain ingredient quality; respond to user requests
- **Pain Points:** Gemini output requires manual JSON editing; duplicate ingredients need cleanup; no bulk operations
- **Language Preference:** Bilingual

#### Persona 3: Arif (Bangladeshi Student Abroad)
- **Age:** 22 | **Location:** Toronto, Canada
- **Tech Comfort:** High (desktop + mobile)
- **Goals:** Cook Bengali dishes from home using available ingredients; share recipes with friends; discover new cuisines
- **Pain Points:** Missing ingredients for Bengali recipes; wants substitution suggestions; wants to share on WhatsApp
- **Language Preference:** English (primary), Bengali (nostalgic)

---

## 4. Current State Analysis

### 4.1 Feature Inventory

| Feature | Status | Quality | Notes |
|---------|--------|---------|-------|
| Recipe browsing & detail pages | ✅ Live | ⭐⭐⭐ | Good detail page with video, steps, ingredients, blog content |
| Ingredient-based recipe search | ✅ Live | ⭐⭐ | Works but loads ALL recipes into memory; no pagination |
| AI recipe import (YouTube→Gemini) | ✅ Live | ⭐ | Frequently fails; no validation; no preview before save |
| Admin recipe CRUD | ✅ Live | ⭐⭐⭐ | Functional with search, filter, edit, delete |
| Admin ingredient management | ✅ Live | ⭐⭐ | Basic CRUD; no merge/dedup tools |
| User favorites | ✅ Live | ⭐⭐⭐ | Works with Supabase auth; grid display |
| User wishlist (shopping list) | ✅ Live | ⭐⭐⭐ | Ingredient-linked shopping list |
| User allergies | ✅ Live | ⭐⭐⭐ | Autocomplete search; linked to ingredients |
| Recipe request system | ✅ Live | ⭐⭐ | 3 submission paths; admin review; **no approval→recipe conversion** |
| Recipe reporting | ✅ Live | ⭐⭐ | Preset reasons; admin review; **hardcoded English** |
| Cooking tracker | ⚠️ Backend only | ⭐ | Full DB schema + server actions; **no UI** |
| AI Chatbot | ✅ Live | ⭐⭐⭐ | Gemini-powered; chat history; bilingual |
| Bilingual (EN/BN) | ⚠️ Partial | ⭐⭐ | Most components support locale toggle; some hardcoded English |
| Dark mode | ✅ Live | ⭐⭐ | Inconsistent across all components |
| Print view | ✅ Live | ⭐⭐⭐ | Clean print layout for recipes |
| Recipe ratings/reviews | ❌ Missing | — | Not implemented |
| Social sharing | ❌ Missing | — | Not implemented |
| Onboarding flow | ❌ Missing | — | No guidance for new users |
| Loading skeletons | ❌ Missing | — | Abrupt loading states |
| Test suite | ❌ Missing | — | CI only runs build + lint |

### 4.2 Critical Pain Points

#### Pain Point 1: Broken AI Recipe Import Pipeline
**Current flow:**
1. Admin gets a YouTube cooking video URL
2. Admin must manually use Gemini (external tool) with the prompt from `GEMINI_PROMPT_READY_TO_USE_V2.md`
3. Gemini output frequently has errors: wrong translations, incorrect ingredient names, malformed JSON
4. Admin manually fixes the JSON
5. Admin pastes corrected JSON into the add-recipe page
6. System attempts to match ingredients (often creates duplicates)

**Desired flow:**
1. Admin pastes YouTube URL
2. System automatically extracts transcript, calls Gemini, validates output
3. Admin sees a preview with editable fields
4. Admin confirms → recipe is saved with correctly matched ingredients

#### Pain Point 2: Ingredient Duplication
**Examples of current duplicates:**
- "Mineral Water" + "Indian Mineral Water" (same concept)
- "Onion" + "onion" + "Onions" + "Yellow Onion" (variants of same)
- "Chicken" + "Chicken Breast" + "Whole Chicken" (related but different — should these be separate?)
- "Garlic" vs. "Garlic Paste" (genuinely different — should stay separate)

**Root cause:** Current matching only does:
1. Case-insensitive exact match on `name_en`
2. Exact match on `name_bn`
3. `contains` substring match (catches "Garlic" in "Garlic Powder" — wrong!)

**Missing:** Semantic understanding, prefix/suffix stripping, phonetic matching, admin confirmation.

#### Pain Point 3: Security Vulnerabilities
- **Admin tokens:** Base64-encoded `adminId:username:timestamp` — anyone can forge this
- **No rate limiting:** API endpoints can be hammered
- **No input validation:** Request bodies aren't validated with schemas
- **No CSRF protection:** POST/DELETE endpoints vulnerable to cross-site attacks
- **No audit trail:** Admin actions (delete recipe, modify ingredient) are untracked

#### Pain Point 4: Performance at Scale
- `search-by-ingredients` loads ALL recipes with full relationships into memory
- No server-side pagination on ingredient search
- Static `recipeData.json` bundled in client increases bundle size
- Admin listing returns full recipe objects with all relations (~50KB per recipe)

---

## 5. Business Requirements

### BR-1: One-Click YouTube URL → Recipe Creation
**Description:** Admin pastes a YouTube URL into a single input field. The system automatically extracts the video transcript, generates a complete recipe using AI, validates the output, and presents a fully editable preview for admin approval before saving.

**Acceptance Criteria:**
- AC-1.1: Single URL input field on admin import page
- AC-1.2: System extracts YouTube video ID and fetches transcript automatically
- AC-1.3: If transcript unavailable, system uses video title/description as fallback
- AC-1.4: AI generates recipe with all required fields (title, ingredients, steps, blog content in EN/BN)
- AC-1.5: System validates AI output against a strict schema before displaying preview
- AC-1.6: Preview shows all fields editable in a user-friendly form (not raw JSON)
- AC-1.7: Ingredient matching suggestions shown with confidence scores
- AC-1.8: Admin can approve, edit, or reject before saving
- AC-1.9: Retry mechanism (up to 3 attempts) if AI fails or produces invalid output
- AC-1.10: Clear progress indicator showing pipeline stages (fetching → generating → validating → ready)
- AC-1.11: Error messages are specific and actionable ("Translation missing for step 3, please add manually")
- AC-1.12: Total time from URL paste to saved recipe < 60 seconds (excluding admin review)

### BR-2: Intelligent Ingredient Deduplication
**Description:** The system intelligently identifies when a new ingredient name refers to an existing ingredient in the database, preventing duplicates through multi-layered matching and admin confirmation.

**Acceptance Criteria:**
- AC-2.1: Strip common prefixes/modifiers: "Indian", "organic", "fresh", "dried", "homemade"
- AC-2.2: Normalize plurals: "tomatoes" → "tomato", "onions" → "onion"
- AC-2.3: Case-insensitive matching across all languages
- AC-2.4: Phonetic matching using existing `phonetic[]` field
- AC-2.5: Fuzzy matching (Levenshtein distance ≤ 2) for typo tolerance
- AC-2.6: When potential match found, present to admin with confidence score (High/Medium/Low)
- AC-2.7: Admin can choose: "Use existing", "Create new", or "Merge (set as synonym)"
- AC-2.8: Ingredient model supports `synonyms` field for known alternative names
- AC-2.9: Existing duplicates can be identified and merged via admin ingredient management tool
- AC-2.10: Merge operation reassigns all recipe relationships from duplicate → canonical ingredient

### BR-3: User Engagement & Social Features
**Description:** Users can rate recipes, write reviews, share recipes on social media, and participate in a cooking community.

**Acceptance Criteria:**
- AC-3.1: 1–5 star rating system on recipe detail page
- AC-3.2: Average rating displayed on recipe cards and detail pages
- AC-3.3: Users can write text reviews (authenticated only)
- AC-3.4: Share buttons for WhatsApp, Facebook, and "Copy Link"
- AC-3.5: "I cooked this!" button to mark completion (linked to cooking tracker)
- AC-3.6: Total cook count displayed on recipe cards
- AC-3.7: Recipe collections/folders for organizing saved recipes

### BR-4: Cooking Tracker with Step-by-Step UI
**Description:** A full-screen, distraction-free cooking mode that guides users through each step with ingredient checklists, timers, and video synchronization.

**Acceptance Criteria:**
- AC-4.1: "Start Cooking" button on recipe detail page launches cooking mode
- AC-4.2: Full-screen layout with large text optimized for kitchen use (greasy hands, distance viewing)
- AC-4.3: Step-by-step navigation with previous/next and step number display
- AC-4.4: Checkmark completion for each step (persisted across page reloads)
- AC-4.5: Ingredient checklist with "I have this" / "I need this" toggles
- AC-4.6: Built-in timer per step (if time specified)
- AC-4.7: Click step → jump to YouTube video timestamp
- AC-4.8: Resume interrupted cooking sessions
- AC-4.9: Responsive design for phone propped up in kitchen
- AC-4.10: Voice-friendly large buttons (no small tap targets)

### BR-5: Smart Recipe Discovery & Search
**Description:** Users can find recipes through multiple discovery methods — ingredient matching, text search, category browsing, filters, and personalized recommendations — all powered by efficient server-side operations.

**Acceptance Criteria:**
- AC-5.1: Ingredient-based search uses server-side database queries (not in-memory filtering)
- AC-5.2: Full-text search across recipe titles, ingredients, and descriptions in both languages
- AC-5.3: Advanced filters: cuisine, difficulty, prep time, cook time, food category, dietary restrictions
- AC-5.4: Filter selections persist in URL query parameters (shareable filtered views)
- AC-5.5: "Similar recipes" section on recipe detail page (same cuisine/category)
- AC-5.6: Recently viewed recipes (stored locally)
- AC-5.7: Trending recipes (most viewed/favorited in last 7 days)
- AC-5.8: Allergy-aware search (exclude recipes containing user's allergens)
- AC-5.9: Search suggestions/autocomplete while typing
- AC-5.10: Paginated results across all listing pages

### BR-6: Complete Bilingual Experience (EN/BN)
**Description:** Every text element in the application is available in both English and Bengali, with consistent switching and persistent language preference.

**Acceptance Criteria:**
- AC-6.1: All UI strings stored in language files (no hardcoded strings)
- AC-6.2: Language preference persisted across sessions (localStorage + user profile)
- AC-6.3: Language toggle accessible from all pages (in navbar)
- AC-6.4: Bengali number formatting where appropriate
- AC-6.5: Report modal, error messages, empty states all bilingual
- AC-6.6: Admin panel fully bilingual
- AC-6.7: Email notifications (future) bilingual

### BR-7: Recipe Request → Approval → Publication Workflow
**Description:** When a user submits a recipe request and an admin approves it, the system should convert the request into a published recipe with minimal effort.

**Acceptance Criteria:**
- AC-7.1: Admin can one-click "Convert to Recipe" from an approved request
- AC-7.2: For "by-name" requests with YouTube URL: trigger AI import pipeline
- AC-7.3: For "submit" type requests: pre-fill recipe form with submitted data
- AC-7.4: For "by-ingredients" requests: suggest recipes from external sources
- AC-7.5: Request status visible to the submitter
- AC-7.6: Admin notes visible internally for collaboration
- AC-7.7: Approved requests link to the created recipe

### BR-8: Mobile-First Responsive Design
**Description:** The platform is designed mobile-first with touch-friendly interactions, optimized for smartphones used in kitchens.

**Acceptance Criteria:**
- AC-8.1: All pages responsive from 320px to 2560px width
- AC-8.2: Touch targets minimum 44x44px
- AC-8.3: No horizontal scrolling on any page
- AC-8.4: Images lazy-loaded with proper aspect ratios
- AC-8.5: Bottom navigation bar on mobile for key actions
- AC-8.6: Swipe gestures for recipe cards (save/dismiss)
- AC-8.7: Optimized for slow connections (progressive loading)

### BR-9: Security & Performance Hardening
**Description:** The platform meets industry security standards and performs well under load.

**Acceptance Criteria:**
- AC-9.1: Admin authentication uses cryptographically signed JWT tokens
- AC-9.2: All API endpoints validate input with schema validation (Zod)
- AC-9.3: Rate limiting on public API endpoints (100 req/min per IP)
- AC-9.4: Rate limiting on AI endpoints (10 req/min per admin)
- AC-9.5: CSRF protection on state-changing endpoints
- AC-9.6: All pages load in < 2 seconds on 4G connection
- AC-9.7: Database queries optimized with proper indexes
- AC-9.8: Recipe detail pages use Incremental Static Regeneration (ISR)
- AC-9.9: API responses cached where appropriate
- AC-9.10: Error boundary components prevent full-page crashes

### BR-10: Admin Dashboard Analytics & Audit Trail
**Description:** Admins have visibility into platform usage, content health, and a complete audit trail of administrative actions.

**Acceptance Criteria:**
- AC-10.1: Dashboard shows: total recipes, total ingredients, total users, recipes added this week
- AC-10.2: Recipe analytics: view count, favorite count, average rating per recipe
- AC-10.3: Ingredient health: count of duplicates detected, ingredients without images
- AC-10.4: Audit log: who did what, when (all create/update/delete admin operations)
- AC-10.5: Exportable reports (CSV)
- AC-10.6: Quick actions: "Fix broken images", "Merge duplicate ingredients", "Process pending requests"

---

## 6. Success Metrics

| Metric | Current State | Target | Measurement |
|--------|--------------|--------|-------------|
| Recipe creation time (YouTube→DB) | ~15 min (manual JSON) | < 1 min (auto pipeline) | Time from URL paste to saved recipe |
| AI import success rate | ~30% (frequent failures) | > 90% (with validation + retry) | Successful imports / total attempts |
| Duplicate ingredient rate | Unknown (many duplicates) | < 2% (with dedup matching) | New duplicates created / total new ingredients |
| Recipe detail page load time | ~3-4 sec | < 1.5 sec | Lighthouse Performance score |
| Ingredient search response time | ~2-5 sec (all recipes in memory) | < 500ms (server-side) | API response time p95 |
| User session duration | Unmeasured | Establish baseline, then +30% | Analytics |
| Bilingual coverage | ~80% (some hardcoded English) | 100% | Audit of all user-facing strings |
| Test coverage | 0% | > 60% for critical paths | Code coverage report |
| Security vulnerabilities | 4 critical (token, rate limit, CSRF, validation) | 0 critical | Security audit |

---

## 7. Constraints & Assumptions

### Constraints
- **Budget:** Open-source project; no paid third-party services beyond existing (Supabase free tier, Gemini API free tier)
- **Team:** Small development team; prioritization is critical
- **Technology:** Committed to Next.js App Router + Prisma + PostgreSQL + Supabase + Gemini stack
- **Data:** Bengali language resources are limited; translations rely on AI + manual review
- **API Limits:** Gemini free tier has request limits that constrain bulk import

### Assumptions
- YouTube cooking videos will continue to have transcripts available (auto-generated or manual)
- Supabase Auth will remain the user authentication provider
- PostgreSQL supports full-text search capabilities needed for recipe discovery
- Bengali (BN) is the primary second language; no other languages planned short-term
- Admin users have technical literacy to review and correct AI-generated content

---

## 8. Out of Scope

The following features are explicitly **not** in scope for v2.0:

- Meal planning / weekly calendar
- Nutritional information calculation
- Grocery delivery integration
- Mobile native app (iOS/Android) — web PWA is sufficient
- Multi-tenant / SaaS model
- Recipe video recording/upload (only YouTube embedding)
- Payment / subscription system
- Third-party recipe import (AllRecipes, Food Network, etc.)
- Internationalization beyond EN/BN (no Hindi, Arabic, etc.)
- User-to-user messaging / social feed
- Integration with smart kitchen devices

---

## 9. Priority Matrix

| Priority | Requirement | Business Impact | Technical Effort | Risk |
|----------|-------------|----------------|-----------------|------|
| **P0 — Critical** | BR-1: YouTube URL → Recipe Pipeline | ⬆️ High (content growth) | ⬆️ High | AI reliability |
| **P0 — Critical** | BR-2: Ingredient Deduplication | ⬆️ High (data quality) | ⬆️ Medium | Algorithm design |
| **P0 — Critical** | BR-9: Security Hardening (JWT, validation) | ⬆️ High (trust) | ⬆️ Medium | Migration risk |
| **P1 — High** | BR-4: Cooking Tracker UI | ⬆️ Medium (engagement) | ⬆️ Medium | UX complexity |
| **P1 — High** | BR-5: Search Performance | ⬆️ High (UX) | ⬆️ Medium | Query optimization |
| **P1 — High** | BR-7: Request → Recipe Workflow | ⬆️ Medium (content loop) | ⬆️ Low | Straightforward |
| **P2 — Medium** | BR-3: Ratings & Reviews | ⬆️ Medium (engagement) | ⬆️ Medium | Schema changes |
| **P2 — Medium** | BR-6: Complete Bilingual | ⬆️ High (differentiator) | ⬆️ Medium | Translation effort |
| **P2 — Medium** | BR-10: Admin Analytics | ⬆️ Low (internal) | ⬆️ Medium | Dashboard design |
| **P3 — Low** | BR-8: Mobile-First Polish | ⬆️ Medium (UX) | ⬆️ Low | Design effort |

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **Recipe** | A complete cooking instruction set with title, ingredients, steps, and metadata in EN/BN |
| **Ingredient** | A canonical food item in the database with English name, Bengali name, image, and phonetic variants |
| **Slug** | URL-friendly unique identifier for a recipe (e.g., `butter-chicken`) |
| **Cooking Progress** | A user's active cooking session tracking step and ingredient completion |
| **Food Category** | Classification: Savory, Sweet, Spicy, Sour, Dessert, Drinks, Appetizer, Soup, Salad |
| **Recipe Request** | A user-submitted request for a recipe (by name, by ingredients, or full submission) |
| **Deduplication** | The process of identifying and merging duplicate ingredient entries |
| **ISR** | Incremental Static Regeneration — Next.js feature for caching and revalidating pages |
| **Gemini** | Google's AI model used for recipe extraction from YouTube transcripts |
| **Phonetic Matching** | Matching ingredients by how they sound (useful for transliterated Bengali words) |
