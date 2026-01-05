# WhatToCook - Intelligent Recipe Discovery Platform

A modern, bilingual recipe discovery platform that helps users find recipes based on available ingredients. Built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

### For Users
- **Ingredient-Based Recipe Search**: Find recipes based on ingredients you have at home
- **Smart Matching Algorithm**: Advanced fuzzy search with phonetic matching for English and বাংলা
- **Bilingual Support**: Complete support for English and বাংলা languages
- **Beautiful Modern UI**: Responsive design with smooth animations using Framer Motion
- **Detailed Recipe Pages**: Complete information with ingredients, steps, timing, and blog content
- **YouTube Integration**: Embedded video tutorials for each recipe
- **Match Percentage**: See exactly what % of ingredients you have for each recipe

### For Admins
- **Comprehensive Dashboard**: Beautiful admin panel with statistics and analytics
- **Recipe Management**: Full CRUD operations for recipes
- **Ingredient Management**: Add, edit, delete ingredients with image support
- **YouTube Import**: AI-powered recipe extraction from YouTube videos
- **Bulk Operations**: Import recipes from JSON, manage ingredients in bulk
- **Real-time Stats**: View recipe counts, categories, cuisines, and more

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks

## 📁 Project Structure

```
whattocook/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Home page with ingredient search
│   ├── admin/               # Admin dashboard
│   │   ├── page.tsx        # Dashboard with stats
│   │   ├── recipes/        # Recipe CRUD
│   │   ├── ingredients/    # Ingredient CRUD
│   │   ├── add-recipe/     # Add new recipe
│   │   └── import/         # YouTube import
│   ├── api/                # API routes
│   │   ├── recipes/        # Recipe endpoints
│   │   │   └── search-by-ingredients/  # Smart search API
│   │   ├── ingredients/    # Ingredient endpoints
│   │   └── admin/          # Admin-only endpoints
│   └── recipes/[slug]/     # Recipe detail pages
├── components/             # React components
│   ├── Hero.tsx           # Hero section with ingredient search
│   ├── IngredientSearch.tsx  # Smart ingredient input
│   ├── IngredientMatchRecipeCard.tsx  # Recipe card with match %
│   ├── RecipeCard*.tsx    # Various recipe card variants
│   └── LanguageProvider.tsx  # Language context
├── lib/                    # Utilities and helpers
│   ├── prisma.ts          # Prisma client
│   ├── matching*.ts       # Ingredient matching algorithms
│   └── ingredients.json   # Ingredient data cache
├── prisma/                 # Database
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Migration history
└── scripts/               # Utility scripts
    ├── checkIngredients.ts
    ├── fixBrokenImages.ts
    ├── importRecipesToDb.ts
    ├── listRecipes.ts
    └── deleteRecipe.ts
```

## 🗄️ Database Schema

### Recipe
- **Basic Info**: `title_en`, `title_bn`, `slug`, `image`, `youtube_url`, `youtube_id`
- **Metadata**: `cuisine`, `category`, `difficulty`, `prep_time`, `cook_time`, `servings`
- **Relations**: `ingredients` (many-to-many), `steps` (one-to-many), `blogContent` (one-to-one)

### Ingredient
- **Names**: `name_en`, `name_bn`
- **Visual**: `img` (image URL)
- **Search**: `phonetic` (phonetic variations for fuzzy search)

### RecipeIngredient (Junction Table)
- Links recipes to ingredients
- Contains: `quantity`, `unit_en`, `unit_bn`, `notes_en`, `notes_bn`

### RecipeStep
- Sequential cooking instructions
- Includes: `step_number`, `instruction_en`, `instruction_bn`, `timestamp`

### RecipeBlogContent
- SEO-friendly blog content
- Bilingual: `intro`, `what_makes_it_special`, `cooking_tips`, `serving`, `storage`, `full_blog`

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+ 
PostgreSQL database
npm or yarn
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd whattocook
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/whattocook"
```

4. **Run database migrations**
```bash
npx prisma migrate dev
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

### Admin Access

Visit `http://localhost:3000/admin` for the admin dashboard

## 📡 API Documentation

### Public Endpoints

#### `GET /api/recipes`
Search and filter recipes
- Query params: `search`, `cuisine`, `category`, `difficulty`, `page`, `limit`
- Returns: Paginated recipe list

#### `POST /api/recipes/search-by-ingredients`
Find recipes matching user ingredients
- Body: `{ ingredients: string[] }`
- Returns: Recipes with match percentage, sorted by relevance

#### `GET /api/recipes/[slug]`
Get recipe details by slug
- Returns: Complete recipe with ingredients, steps, blog content

#### `GET /api/ingredients`
List all ingredients
- Query params: `search`, `page`, `limit`
- Returns: Paginated ingredient list

### Admin Endpoints

All admin endpoints require authentication (implement as needed)

#### Recipe Management
- `POST /api/admin/recipes` - Create recipe
- `PUT /api/admin/recipes/[id]` - Update recipe
- `DELETE /api/admin/recipes/[id]` - Delete recipe

#### Ingredient Management
- `POST /api/admin/ingredients` - Create ingredient
- `PUT /api/admin/ingredients/[id]` - Update ingredient
- `DELETE /api/admin/ingredients/[id]` - Delete ingredient

## 🔍 Intelligent Matching Algorithm

The platform uses a sophisticated ingredient matching system:

1. **Normalization**: Removes special characters, handles Bangla numerals
2. **Fuzzy Matching**: Allows partial matches (e.g., "tomato" matches "tomatoes")
3. **Phonetic Search**: Handles pronunciation variations
4. **Bilingual Support**: Searches both English and Bangla ingredient names
5. **Smart Scoring**: 
   - Calculates match percentage: (matched ingredients / total ingredients)
   - Prioritizes 100% matches (recipes you can make right now)
   - Sorts by match percentage, then by missing ingredient count
   - Shows exactly what ingredients are missing

### Example
User has: `cauliflower`, `flour`, `oil`

Result for "Cauliflower Pakora" (needs 10 ingredients):
- Matched: 3/10 ingredients (30% match)
- Missing: 7 ingredients
- Status: Shows as partial match with missing count

## 🎨 Admin Dashboard Features

### Dashboard Overview
- **Statistics Cards**: Total recipes, ingredients, categories, cuisines
- **Category Breakdown**: Visual bars showing recipe distribution
- **Cuisine Analytics**: Most popular cuisines
- **Quick Actions**: Jump to common tasks

### Recipe Management (`/admin/recipes`)
- **List View**: All recipes with search and filters
- **Search**: By title (English/Bangla)
- **Filters**: By cuisine, category
- **Actions**: View, Edit, Delete
- **Bulk View**: See all recipes at once

### Ingredient Management (`/admin/ingredients`)
- **Grid View**: All ingredients with images
- **Add/Edit**: Modal interface for quick editing
- **Image Preview**: See ingredient images before saving
- **Search**: Find ingredients quickly

### YouTube Import (`/admin/import`)
- **AI Extraction**: Paste YouTube URL to auto-extract recipe
- **Supported Formats**: 
  - `youtube.com/watch?v=VIDEO_ID`
  - `youtu.be/VIDEO_ID`
  - Just the `VIDEO_ID`
- **Auto-creation**: Missing ingredients are created automatically

### Add Recipe (`/admin/add-recipe`)
- **JSON Input**: Paste complete recipe JSON
- **Validation**: Real-time validation of required fields
- **Auto-ingredient Creation**: System creates missing ingredients
- **Sample Format**: Built-in example for reference

## 🧪 Utility Scripts

### Check Ingredients for Issues
```bash
npx tsx scripts/checkIngredients.ts
```
- Finds duplicate ingredients (by English or Bangla name)
- Identifies broken or missing images
- Reports statistics

### Fix Broken Images
```bash
npx tsx scripts/fixBrokenImages.ts
```
- Auto-fixes missing ingredient images
- Uses TheMealDB API for standard ingredients
- Reports success/failure for each ingredient

### Import Recipes from JSON
```bash
npx tsx scripts/importRecipesToDb.ts
```
- Bulk import recipes from JSON files
- Validates data before import
- Creates missing ingredients

### List All Recipes
```bash
npx tsx scripts/listRecipes.ts
```
- Shows all recipes with IDs and slugs
- Useful for finding recipe IDs for deletion

### Delete a Recipe
```bash
npx tsx scripts/deleteRecipe.ts <slug>
```
Example: `npx tsx scripts/deleteRecipe.ts hyderabadi-chicken-masala`

## 🌐 Deployment

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Optional
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Database Setup for Production
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 📝 Adding New Recipes

### Method 1: Via Admin Panel
1. Go to `/admin/add-recipe`
2. Paste recipe JSON (get from AI tools like ChatGPT/Claude)
3. System validates and auto-creates missing ingredients
4. Recipe goes live immediately

### Method 2: Via YouTube Import
1. Go to `/admin/import`
2. Paste YouTube video URL
3. AI extracts recipe data
4. Review and confirm
5. Recipe imported with video embedded

### Recipe JSON Format
```json
{
  "slug": "unique-recipe-slug",
  "title_en": "Recipe Title",
  "title_bn": "রেসিপি শিরোনাম",
  "image": "https://...",
  "youtube_url": "https://youtube.com/watch?v=...",
  "youtube_id": "VIDEO_ID",
  "cuisine": "Indian",
  "category": "Main Course",
  "difficulty": "Medium",
  "prep_time": 30,
  "cook_time": 45,
  "servings": 4,
  "ingredients": [...],
  "steps": [...],
  "blogContent": {...}
}
```

## 🔧 Database Maintenance

### Reset Database
```bash
npx prisma migrate reset
```

### View Database in Browser
```bash
npx prisma studio
```

### Generate New Migration
```bash
npx prisma migrate dev --name migration_name
```

## 🤝 Contributing

This is a private project. Contact the owner for contribution guidelines.

## 📄 License

Proprietary - All rights reserved

## 🆘 Support & Issues

For questions or issues, contact the development team.

---

**Last Updated**: Auto-generated on every commit
**Version**: 2.0.0
**Database Schema Version**: See `prisma/migrations` for current version
