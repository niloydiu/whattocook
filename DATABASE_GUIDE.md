# 🗄️ PostgreSQL Database Guide for WhatToCook

## 📊 Database Overview

Your application now uses **PostgreSQL** with **Prisma ORM** for data management. All 1200 ingredients and recipes are stored in a relational database for better performance, scalability, and data integrity.

### Database Tables

1. **ingredients** - 1200 ingredients with bilingual names
2. **recipes** - Recipe metadata and information
3. **recipe_ingredients** - Links recipes to ingredients (many-to-many)
4. **recipe_steps** - Cooking instructions with YouTube timestamps
5. **recipe_blog_content** - Full blog content for recipes
6. **admins** - Admin users for authentication

---

## 🚀 Quick Start

### View Database

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit data.

### Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these in production!**

---

## 📝 Database Schema

### Ingredient Table

```prisma
model Ingredient {
  id        Int      // Auto-increment ID
  name_en   String   // English name
  name_bn   String   // Bengali name
  img       String   // Image path
  phonetic  String[] // Phonetic variations for search
}
```

### Recipe Table

```prisma
model Recipe {
  id           Int
  slug         String   // URL-friendly identifier
  title_en     String
  title_bn     String
  image        String
  youtube_url  String
  youtube_id   String
  cuisine      String   // e.g., "Indian, Bengali"
  category     String   // e.g., "Main Course"
  difficulty   String   // easy/medium/hard
  prep_time    Int      // minutes
  cook_time    Int      // minutes
  servings     Int
}
```

---

## 🔐 Admin API Routes

### Login

```bash
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Returns:
{
  "success": true,
  "token": "base64-token-here",
  "admin": { "id": 1, "username": "admin" }
}
```

### Manage Ingredients

```bash
# Get all ingredients (with pagination)
GET /api/admin/ingredients?page=1&limit=50&search=chicken
Authorization: Bearer YOUR_TOKEN

# Get single ingredient
GET /api/admin/ingredients/1
Authorization: Bearer YOUR_TOKEN

# Create ingredient
POST /api/admin/ingredients
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name_en": "Tomato",
  "name_bn": "টমেটো",
  "img": "/ingredients/tomato.jpg",
  "phonetic": ["tomato", "tamatar", "tometo"]
}

# Update ingredient
PUT /api/admin/ingredients/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name_en": "Updated Name",
  "name_bn": "আপডেট করা নাম",
  "img": "/ingredients/updated.jpg",
  "phonetic": ["updated"]
}

# Delete ingredient
DELETE /api/admin/ingredients/1
Authorization: Bearer YOUR_TOKEN
```

### Manage Recipes

```bash
# Get all recipes
GET /api/admin/recipes?page=1&limit=20
Authorization: Bearer YOUR_TOKEN

# Get single recipe
GET /api/admin/recipes/1
Authorization: Bearer YOUR_TOKEN

# Create recipe
POST /api/admin/recipes
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "slug": "chicken-biryani",
  "title_en": "Chicken Biryani",
  "title_bn": "চিকেন বিরিয়ানি",
  "image": "https://example.com/image.jpg",
  "youtube_url": "https://youtube.com/watch?v=...",
  "youtube_id": "VIDEO_ID",
  "cuisine": "Indian",
  "category": "Main Course",
  "difficulty": "medium",
  "prep_time": 30,
  "cook_time": 60,
  "servings": 4,
  "ingredients": [
    {
      "ingredient_id": 1,
      "quantity": "1 kg",
      "unit_en": "kg",
      "unit_bn": "কেজি",
      "notes_en": "boneless",
      "notes_bn": "হাড়বিহীন"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "instruction_en": "Heat oil in a pan",
      "instruction_bn": "প্যানে তেল গরম করুন",
      "timestamp": "0:30"
    }
  ],
  "blogContent": {
    "intro_en": "This is an amazing recipe...",
    "intro_bn": "এটি একটি আশ্চর্যজনক রেসিপি...",
    "what_makes_it_special_en": "...",
    "what_makes_it_special_bn": "...",
    "cooking_tips_en": "...",
    "cooking_tips_bn": "...",
    "serving_en": "...",
    "serving_bn": "...",
    "storage_en": "...",
    "storage_bn": "...",
    "full_blog_en": "...",
    "full_blog_bn": "..."
  }
}

# Update recipe
PUT /api/admin/recipes/1
Authorization: Bearer YOUR_TOKEN
# Same body as POST

# Delete recipe
DELETE /api/admin/recipes/1
Authorization: Bearer YOUR_TOKEN
```

---

## 👥 User API Routes (Public)

### Search Recipes

```bash
# Search recipes
GET /api/recipes?search=chicken&cuisine=Indian&difficulty=easy&page=1&limit=12

# Returns:
{
  "recipes": [
    {
      "id": 1,
      "slug": "chicken-curry",
      "title_en": "Chicken Curry",
      "title_bn": "চিকেন কারি",
      "image": "...",
      "cuisine": "Indian",
      "category": "Main Course",
      "difficulty": "medium",
      "prep_time": 20,
      "cook_time": 40,
      "servings": 4
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "totalPages": 9
  }
}
```

### Get Recipe Details

```bash
# Get full recipe by slug
GET /api/recipes/chicken-curry

# Returns:
{
  "id": 1,
  "slug": "chicken-curry",
  "title_en": "Chicken Curry",
  "title_bn": "চিকেন কারি",
  "image": "...",
  "youtube_url": "https://youtube.com/watch?v=...",
  "youtube_id": "VIDEO_ID",
  "cuisine": "Indian",
  "difficulty": "medium",
  "prep_time": 20,
  "cook_time": 40,
  "servings": 4,
  "ingredients": [
    {
      "ingredient": {
        "id": 1,
        "name_en": "Chicken",
        "name_bn": "চিকেন",
        "img": "/ingredients/chicken.jpg"
      },
      "quantity": "1 kg",
      "unit_en": "kg",
      "unit_bn": "কেজি",
      "notes_en": "boneless",
      "notes_bn": "হাড়বিহীন"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "instruction_en": "...",
      "instruction_bn": "...",
      "timestamp": "0:30"
    }
  ],
  "blogContent": {
    "intro_en": "...",
    "intro_bn": "...",
    "full_blog_en": "...",
    "full_blog_bn": "..."
  }
}
```

### Search Ingredients

```bash
# Search ingredients
GET /api/ingredients?search=chicken&page=1&limit=50

# Returns:
{
  "ingredients": [
    {
      "id": 1,
      "name_en": "Chicken",
      "name_bn": "চিকেন",
      "img": "/ingredients/chicken.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1200,
    "totalPages": 24
  }
}
```

---

## 🛠️ Useful Scripts

### Create Admin User

```bash
# Create new admin
npx tsx scripts/createAdmin.ts USERNAME PASSWORD

# Example:
npx tsx scripts/createAdmin.ts admin admin123
```

### Import Ingredients from JSON

```bash
# Migrate all ingredients from lib/ingredients.json to database
npx tsx scripts/migrateIngredientsToDb.ts
```

### Import Recipes from JSON files

```bash
# Import all recipes from lib/recipes/*.json to database
npx tsx scripts/importRecipesToDb.ts
```

### Database Management

```bash
# View database in browser
npx prisma studio

# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Create new migration after schema changes
npx prisma migrate dev --name your_migration_name

# Generate Prisma Client after schema changes
npx prisma generate
```

---

## 🎨 Building the Frontend

### Recipe Search Page

```typescript
// app/recipes/page.tsx
export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { search?: string; cuisine?: string };
}) {
  const response = await fetch(
    `http://localhost:3000/api/recipes?search=${
      searchParams.search || ""
    }&cuisine=${searchParams.cuisine || ""}`,
    { cache: "no-store" }
  );
  const data = await response.json();

  return (
    <div>
      {data.recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
```

### Recipe Detail Page

```typescript
// app/recipes/[slug]/page.tsx
export default async function RecipeDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const response = await fetch(
    `http://localhost:3000/api/recipes/${params.slug}`,
    { cache: "no-store" }
  );
  const recipe = await response.json();

  return (
    <div>
      <h1>{recipe.title_en}</h1>

      {/* YouTube Video */}
      <iframe
        src={`https://www.youtube.com/embed/${recipe.youtube_id}`}
        width="100%"
        height="500px"
      />

      {/* Open in YouTube App/Website Button */}
      <a href={recipe.youtube_url} target="_blank" className="btn">
        Open in YouTube
      </a>

      {/* Ingredients */}
      <div>
        {recipe.ingredients.map((ing) => (
          <div key={ing.id}>
            <img src={ing.ingredient.img} alt={ing.ingredient.name_en} />
            {ing.quantity} {ing.unit_en} {ing.ingredient.name_en}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div>
        {recipe.steps.map((step) => (
          <div key={step.step_number}>
            <h3>Step {step.step_number}</h3>
            <p>{step.instruction_en}</p>
            {step.timestamp && <span>Timestamp: {step.timestamp}</span>}
          </div>
        ))}
      </div>

      {/* Blog Content */}
      <div
        dangerouslySetInnerHTML={{ __html: recipe.blogContent.full_blog_en }}
      />
    </div>
  );
}
```

---

## 🔍 How to Use in Your App

### 1. Recipe Search Flow

User types recipe name → Frontend calls `/api/recipes?search=...` → Shows recipe cards → User clicks card → Navigate to `/recipes/[slug]` → Show full recipe with video + blog

### 2. YouTube Integration

```typescript
// Detect mobile vs desktop
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

// YouTube button
<a
  href={recipe.youtube_url}
  onClick={(e) => {
    if (isMobile) {
      // Open in YouTube app
      window.location.href = `youtube://watch?v=${recipe.youtube_id}`
    }
    // Desktop opens in new tab automatically
  }}
>
  {isMobile ? 'Open in YouTube App' : 'Watch on YouTube'}
</a>
```

### 3. Admin Panel Example

```typescript
// app/admin/page.tsx
"use client";
import { useState } from "react";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const login = async () => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      localStorage.setItem("adminToken", data.token);
    }
  };

  const createRecipe = async (recipeData) => {
    await fetch("/api/admin/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(recipeData),
    });
  };

  return <div>{/* Admin UI here */}</div>;
}
```

---

## 📈 Database Stats

- ✅ **1200 ingredients** migrated successfully
- ✅ **1 recipe** imported (Hyderabadi Chicken Masala)
- ✅ **6 tables** with proper relationships
- ✅ **Indexed fields** for fast searching

---

## 🔒 Security Notes

1. **Change admin credentials** before deploying to production
2. **Use environment variables** for DATABASE_URL
3. **Add rate limiting** to API routes in production
4. **Implement JWT** instead of basic token for better security
5. **Add CORS** protection for API routes
6. **Sanitize user inputs** before database queries

---

## 🚨 Troubleshooting

### Database Connection Errors

```bash
# Check if PostgreSQL is running
psql --version

# Restart PostgreSQL
brew services restart postgresql@14

# Test connection
psql -U niloy -d whattocook
```

### Prisma Errors

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database
npx prisma migrate reset

# Check database status
npx prisma db push
```

---

## 🎯 Next Steps

1. **Build the UI**: Create recipe search and detail pages
2. **Add more recipes**: Import recipes from YouTube using Gemini
3. **Implement filters**: Add cuisine, difficulty, category filters
4. **Build admin panel**: Create a proper admin dashboard
5. **Deploy**: Use Vercel for Next.js + Supabase/Neon for PostgreSQL

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Database is ready! 🎉 All 1200 ingredients imported, admin system set up, and APIs are live!**
