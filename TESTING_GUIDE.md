# Testing Guide - Recipe Request & Food Category Feature

## Quick Testing Checklist

### ✅ Prerequisites
- [x] Prisma schema updated
- [x] Database migrated with `npx prisma db push`
- [x] Prisma client regenerated with `npx prisma generate`
- [x] Dev server running on `localhost:3000`

## 🧪 Test Scenarios

### 1. Navigation & UI Testing

#### Test 1.1: Main Navigation
- [ ] Open `localhost:3000`
- [ ] Verify "Request Recipe" button appears in navbar (gradient red-orange)
- [ ] Click button and verify redirect to `/request-recipe`
- [ ] Verify button shows icon on mobile, icon + text on desktop

#### Test 1.2: Landing Page
- [ ] On `/request-recipe`, verify 3 animated cards appear
- [ ] Verify cards have correct icons and colors:
  - Submit Recipe: ClipboardList, red-orange gradient
  - By Ingredients: Utensils, green-teal gradient
  - By Name/Video: Youtube, blue-purple gradient
- [ ] Test language toggle (EN ↔ বাংলা)
- [ ] Verify "How It Works" section displays correctly
- [ ] Click each card and verify correct navigation

### 2. Submit Recipe Form Testing

#### Test 2.1: Multi-Step Wizard
- [ ] Navigate to `/request-recipe/submit`
- [ ] Verify progress bar shows 4 steps
- [ ] **Step 1 - Basic Info**:
  - [ ] Fill recipe name in English and Bangla
  - [ ] Enter cuisine and category
  - [ ] Select food category from dropdown (should default to "Savory")
  - [ ] Adjust prep time, cook time, servings, difficulty
  - [ ] Click "Next" and verify navigation to Step 2

#### Test 2.2: Ingredients Builder
- [ ] **Step 2 - Ingredients**:
  - [ ] Add ingredient with name (EN/BN), quantity, unit
  - [ ] Click "Add Ingredient" to add more
  - [ ] Remove an ingredient using trash icon
  - [ ] Verify at least 1 ingredient required
  - [ ] Click "Next" to proceed
  - [ ] Click "Previous" to go back and verify data persists

#### Test 2.3: Cooking Steps
- [ ] **Step 3 - Cooking Steps**:
  - [ ] Add instruction in English and Bangla
  - [ ] Add multiple steps
  - [ ] Remove a step using trash icon
  - [ ] Verify step numbers auto-adjust
  - [ ] Click "Next" to proceed

#### Test 2.4: Contact & Submit
- [ ] **Step 4 - Contact Info**:
  - [ ] Optionally fill name and email
  - [ ] Click "Submit Recipe"
  - [ ] Verify loading state shows
  - [ ] Verify success screen appears with green checkmark
  - [ ] Verify auto-redirect to landing page after 3 seconds

### 3. Request by Ingredients Testing

#### Test 3.1: Ingredient Search & Selection
- [ ] Navigate to `/request-recipe/by-ingredients`
- [ ] Verify all ingredients load in grid layout
- [ ] Test search functionality:
  - [ ] Type "chicken" and verify filtering works
  - [ ] Type Bengali text and verify it works
  - [ ] Clear search and verify all ingredients return

#### Test 3.2: Selection & Submission
- [ ] Select 3-5 ingredients by clicking cards
- [ ] Verify selected ingredients appear in right panel
- [ ] Verify selected count shows in submit button
- [ ] Remove ingredient using X button
- [ ] Add optional name, email, notes
- [ ] Click submit button
- [ ] Verify loading state
- [ ] Verify success screen
- [ ] Verify auto-redirect

### 4. Request by Name/YouTube Testing

#### Test 4.1: Recipe Name Request
- [ ] Navigate to `/request-recipe/by-name`
- [ ] Verify "By Recipe Name" is selected by default
- [ ] Enter a recipe name (e.g., "Chicken Biryani")
- [ ] Add optional notes
- [ ] Add optional contact info
- [ ] Submit form
- [ ] Verify success screen

#### Test 4.2: YouTube URL Request
- [ ] Click "By YouTube Video" toggle
- [ ] Verify YouTube URL input field appears
- [ ] Enter a YouTube URL
- [ ] Test form validation (should require valid URL)
- [ ] Submit form
- [ ] Verify success screen

### 5. Food Category Display Testing

#### Test 5.1: Recipe Cards
- [ ] Navigate to main page
- [ ] Find a recipe with foodCategory set
- [ ] Verify purple/pink gradient badge appears on card
- [ ] Badge should show at bottom-left of recipe image

#### Test 5.2: Recipe Detail Page
- [ ] Click on a recipe
- [ ] Navigate to recipe detail page
- [ ] Verify food category badge appears alongside difficulty, cuisine, category
- [ ] Badge should have gradient purple/pink background

### 6. Admin Panel Testing

#### Test 6.1: Navigation
- [ ] Login to admin panel
- [ ] Verify "Requests" link appears in admin navigation
- [ ] Click "Requests" link
- [ ] Verify redirect to `/admin/recipe-requests`

#### Test 6.2: Request List
- [ ] Verify all submitted requests appear
- [ ] Test status filter (All, Pending, Approved, Rejected)
- [ ] Test type filter (All, Submitted, By Ingredients, By Name/Video)
- [ ] Verify request count updates with filters

#### Test 6.3: Request Details
- [ ] Click on a request to expand
- [ ] Verify all submitted data displays correctly:
  - For submit type: full recipe details, ingredients, steps
  - For by-ingredients: list of ingredients
  - For by-name: recipe name or YouTube URL
- [ ] Verify user contact info shows if provided
- [ ] Verify submission date displays

#### Test 6.4: Approval Workflow
- [ ] Find a pending request
- [ ] Click green checkmark to approve
- [ ] Verify loading spinner appears
- [ ] Verify status updates to "approved"
- [ ] Verify badge color changes to green
- [ ] Find another pending request
- [ ] Click red X to reject
- [ ] Verify status updates to "rejected"
- [ ] Verify badge color changes to red

### 7. API Endpoint Testing

#### Test 7.1: Create Request
```bash
curl -X POST http://localhost:3000/api/recipe-requests \
  -H "Content-Type: application/json" \
  -d '{
    "requestType": "by-name",
    "recipeName": "Test Recipe",
    "userEmail": "test@example.com"
  }'
```
- [ ] Verify 201 status code
- [ ] Verify response contains created request

#### Test 7.2: List Requests
```bash
curl http://localhost:3000/api/recipe-requests
```
- [ ] Verify 200 status code
- [ ] Verify response contains array of requests
- [ ] Verify pagination info (page, limit, total)

#### Test 7.3: Filter by Category
```bash
curl http://localhost:3000/api/recipes?foodCategory=Sweet
```
- [ ] Verify only recipes with foodCategory="Sweet" return

### 8. Bilingual Testing

#### Test 8.1: Language Toggle
- [ ] Test all forms in English mode
- [ ] Switch to Bangla (বাংলা)
- [ ] Verify all labels, buttons, placeholders update
- [ ] Test form submission in Bangla mode
- [ ] Verify success messages show in correct language

### 9. Responsive Testing

#### Test 9.1: Mobile View (< 768px)
- [ ] Open DevTools, switch to mobile view
- [ ] Verify landing page cards stack vertically
- [ ] Verify forms are readable and usable
- [ ] Verify navigation button shows icon only
- [ ] Test all features work on mobile

#### Test 9.2: Tablet View (768px - 1024px)
- [ ] Verify 2-column layouts work
- [ ] Verify all features work on tablet

#### Test 9.3: Desktop View (> 1024px)
- [ ] Verify full layouts display correctly
- [ ] Verify hover effects work
- [ ] Test all features on desktop

### 10. Error Handling

#### Test 10.1: Network Errors
- [ ] Disconnect network
- [ ] Try submitting a request
- [ ] Verify error handling (form should not submit)

#### Test 10.2: Validation Errors
- [ ] Try submitting empty forms
- [ ] Verify required field validation
- [ ] Try submitting invalid data (e.g., negative numbers)

## 🐛 Known Issues / Notes

### TypeScript Errors
- TypeScript may show errors for `prisma.recipeRequest` in API routes
- This is a language server caching issue
- **Fix**: Run `npx prisma generate` and restart TypeScript server
- Code will work correctly at runtime

### Database Connection
- If you see connection pool errors, ensure `.env` has correct DATABASE_URL
- Connection pool set to 10 connections, 60s timeout

## ✅ Success Criteria

All features are working correctly if:
- [ ] All 3 request types can be submitted successfully
- [ ] Requests appear in admin panel
- [ ] Admin can approve/reject requests
- [ ] Food categories display on recipe cards and detail pages
- [ ] Bilingual support works throughout
- [ ] Responsive design works on all screen sizes
- [ ] No console errors during normal usage

## 📊 Test Results

**Test Date**: ___________  
**Tester**: ___________  
**Environment**: Development / Production  
**Browser**: ___________  

| Feature | Status | Notes |
|---------|--------|-------|
| Navigation | ⬜ Pass / ⬜ Fail | |
| Submit Recipe Form | ⬜ Pass / ⬜ Fail | |
| By Ingredients Form | ⬜ Pass / ⬜ Fail | |
| By Name/YouTube Form | ⬜ Pass / ⬜ Fail | |
| Food Category Display | ⬜ Pass / ⬜ Fail | |
| Admin Request Management | ⬜ Pass / ⬜ Fail | |
| Bilingual Support | ⬜ Pass / ⬜ Fail | |
| Responsive Design | ⬜ Pass / ⬜ Fail | |

---

**Happy Testing! 🎉**
