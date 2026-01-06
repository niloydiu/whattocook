# Recipe Request & Category Feature Implementation Plan

## Project Overview
Add user recipe request functionality and food category system to whattocook application.

## Features to Implement

### 1. Recipe Categories System
- Add new category field to recipe schema
- Categories: Dessert, Spicy, Sour, Sweet, Savory, Drinks, Appetizer, Soup, Salad, etc.
- Update all recipe displays and filters

### 2. Recipe Request Types
#### A. Submit Recipe (Step-by-Step Form)
- User-friendly multi-step form
- Fields: title, category, ingredients, steps, cooking time, etc.
- Save as pending request for admin approval

#### B. Request Recipe by Ingredients
- User selects available ingredients
- System suggests what can be made
- User can request new recipe combinations

#### C. Request Recipe by Name/YouTube
- Input: Recipe name or YouTube URL
- Admin can process and add to database

## Implementation Steps

### ✅ COMPLETED
- [x] Step 1: Create implementation plan
- [x] Step 2: Update Prisma schema (Added foodCategory to Recipe, created RecipeRequest model)
- [x] Step 3: Push schema changes to database
- [x] Step 4: Create Recipe Request API routes (/api/recipe-requests)
- [x] Step 5: Update Recipe API for categories (foodCategory query support)
- [x] Step 6: Create request recipe landing page (/request-recipe)
- [x] Step 7: Create step-by-step recipe submission form (/request-recipe/submit)
- [x] Step 8: Create ingredient-based request form (/request-recipe/by-ingredients)
- [x] Step 9: Create YouTube/name request form (/request-recipe/by-name)
- [x] Step 10: Add "Request Recipe" navigation (main navbar)
- [x] Step 11: Update recipe displays with categories (RecipeCardApi, recipe detail page)
- [x] Step 12: Create admin recipe request management page (/admin/recipe-requests)

### 📋 TODO

#### Phase 5: Testing & Polish (Steps 13-14)
- [ ] Step 13: End-to-end testing
  - Test all request types
  - Test category filters
  - Test admin approval workflow

- [ ] Step 14: UI/UX refinements
  - Polish forms
  - Add loading states
  - Add success/error messages

## Files Created/Modified

### ✅ New Files Created
- [x] `/app/api/recipe-requests/route.ts`
- [x] `/app/api/recipe-requests/[id]/route.ts`
- [x] `/app/request-recipe/page.tsx`
- [x] `/app/request-recipe/submit/page.tsx`
- [x] `/app/request-recipe/by-ingredients/page.tsx`
- [x] `/app/request-recipe/by-name/page.tsx`
- [x] `/app/admin/recipe-requests/page.tsx`

### ✅ Files Modified
- [x] `/prisma/schema.prisma` - Added foodCategory and RecipeRequest model
- [x] `/app/page.tsx` - Added request recipe button to navbar
- [x] `/app/api/recipes/route.ts` - Added category query support
- [x] `/app/recipes/[slug]/page.tsx` - Display category badge
- [x] `/app/admin/layout.tsx` - Added recipe requests to admin nav
- [x] `/components/RecipeCardApi.tsx` - Display food categories

## Current Status
**Phase**: Completed Core Implementation
**Last Completed Step**: Step 12 - Admin recipe request management
**Next Step**: Step 13 - Testing

## Notes
- ✅ Using existing admin authentication for request management
- ✅ Category is filterable and searchable
- ✅ Recipe requests have status: pending, approved, rejected
- ⏳ Consider adding email notifications for request status changes (future enhancement)

---
**Started**: 2026-01-06
**Last Updated**: 2026-01-06
**Implementation Status**: 🎉 FEATURE COMPLETE - Ready for Testing
