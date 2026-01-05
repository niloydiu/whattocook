# ✅ Database Setup Complete!

## 🎉 What Has Been Done

### 1. ✅ PostgreSQL Database Created

- Database name: `whattocook`
- Running on: `localhost:5432`
- User: `niloy`

### 2. ✅ Prisma ORM Installed & Configured

- Prisma Client v5.22.0
- Schema defined in `prisma/schema.prisma`
- 6 tables with proper relationships

### 3. ✅ All 1200 Ingredients Migrated

- Successfully imported from `lib/ingredients.json`
- Each ingredient has: id, name_en, name_bn, img, phonetic[]
- Indexed for fast searching

### 4. ✅ Admin Authentication System

- Admin table created
- Default admin user: `username: admin, password: admin123`
- Token-based authentication (Bearer token)
- Script to create new admins: `npx tsx scripts/createAdmin.ts USERNAME PASSWORD`

### 5. ✅ Admin API Routes (Protected)

All routes require `Authorization: Bearer TOKEN` header

**Ingredients:**

- `GET /api/admin/ingredients` - List with pagination & search
- `GET /api/admin/ingredients/[id]` - Get single ingredient
- `POST /api/admin/ingredients` - Create new ingredient
- `PUT /api/admin/ingredients/[id]` - Update ingredient
- `DELETE /api/admin/ingredients/[id]` - Delete ingredient

**Recipes:**

- `GET /api/admin/recipes` - List with pagination
- `GET /api/admin/recipes/[id]` - Get single recipe
- `POST /api/admin/recipes` - Create new recipe
- `PUT /api/admin/recipes/[id]` - Update recipe
- `DELETE /api/admin/recipes/[id]` - Delete recipe

**Authentication:**

- `POST /api/admin/login` - Admin login

### 6. ✅ Public API Routes (No Auth Required)

**For Users:**

- `GET /api/recipes` - Search recipes (with filters: search, cuisine, category, difficulty)
- `GET /api/recipes/[slug]` - Get full recipe by slug with ingredients, steps, and blog content
- `GET /api/ingredients` - Search ingredients

### 7. ✅ Recipe Import System

- Script to import recipes from JSON: `npx tsx scripts/importRecipesToDb.ts`
- 1 recipe already imported: "Hyderabadi Chicken Masala"
- Recipe includes: ingredients with quantities, steps with timestamps, blog content (bilingual)

---

## 📊 Database Schema Summary

```
ingredients (1200 rows)
├── id (PK)
├── name_en
├── name_bn
├── img
└── phonetic[] (for fuzzy search)

recipes
├── id (PK)
├── slug (unique)
├── title_en, title_bn
├── image, youtube_url, youtube_id
├── cuisine, category, difficulty
├── prep_time, cook_time, servings
└── timestamps

recipe_ingredients (junction table)
├── recipe_id (FK → recipes)
├── ingredient_id (FK → ingredients)
├── quantity, unit_en, unit_bn
└── notes_en, notes_bn

recipe_steps
├── recipe_id (FK → recipes)
├── step_number
├── instruction_en, instruction_bn
└── timestamp (YouTube video)

recipe_blog_content (1:1 with recipes)
├── recipe_id (FK → recipes)
├── intro_en, intro_bn
├── what_makes_it_special_en/bn
├── cooking_tips_en/bn
├── serving_en/bn
├── storage_en/bn
└── full_blog_en/bn

admins
├── id (PK)
├── username (unique)
├── password_hash
└── email (optional)
```

---

## 🚀 How to Use

### Start Development Server

```bash
npm run dev
```

### View Database in Browser

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Test API Endpoints

**Get all recipes:**

```bash
curl http://localhost:3000/api/recipes
```

**Search recipes:**

```bash
curl "http://localhost:3000/api/recipes?search=chicken&cuisine=Indian"
```

**Get recipe details:**

```bash
curl http://localhost:3000/api/recipes/hyderabadi-chicken-masala
```

**Admin login:**

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Get ingredients (admin):**

```bash
curl http://localhost:3000/api/admin/ingredients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 Next Steps to Build Your App

### 1. Create Recipe Search Page

Create `app/recipes/page.tsx`:

```typescript
export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/recipes?search=${
      searchParams.search || ""
    }`,
    { cache: "no-store" }
  );
  const data = await res.json();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
```

### 2. Create Recipe Detail Page

Create `app/recipes/[slug]/page.tsx`:

```typescript
export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/recipes/${slug}`,
    { cache: "no-store" }
  );
  const recipe = await res.json();

  return (
    <div>
      <h1>{recipe.title_en}</h1>

      {/* Embedded YouTube Video */}
      <iframe
        src={`https://www.youtube.com/embed/${recipe.youtube_id}`}
        width="100%"
        height="500px"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Open in YouTube Button */}
      <a href={recipe.youtube_url} target="_blank" className="btn">
        Open in YouTube
      </a>

      {/* Ingredients */}
      <div className="ingredients">
        <h2>Ingredients</h2>
        {recipe.ingredients.map((ing) => (
          <div key={ing.id} className="flex items-center gap-2">
            <img
              src={ing.ingredient.img}
              alt={ing.ingredient.name_en}
              width={40}
            />
            <span>
              {ing.quantity} {ing.ingredient.name_en}
            </span>
            {ing.notes_en && (
              <span className="text-sm text-gray-500">({ing.notes_en})</span>
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="steps">
        <h2>Steps</h2>
        {recipe.steps.map((step) => (
          <div key={step.step_number}>
            <h3>Step {step.step_number}</h3>
            <p>{step.instruction_en}</p>
            {step.timestamp && (
              <a href={`${recipe.youtube_url}&t=${step.timestamp}`}>
                ⏱️ {step.timestamp}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Blog Content */}
      <div className="blog-content">
        <div
          dangerouslySetInnerHTML={{ __html: recipe.blogContent.full_blog_en }}
        />
      </div>
    </div>
  );
}
```

### 3. YouTube Mobile/Desktop Detection

```typescript
"use client";

export function YouTubeButton({ youtubeUrl, youtubeId }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      // Try to open in YouTube app
      window.location.href = `youtube://watch?v=${youtubeId}`;
      // Fallback to web after 2 seconds
      setTimeout(() => {
        window.open(youtubeUrl, "_blank");
      }, 2000);
    }
  };

  return (
    <a href={youtubeUrl} onClick={handleClick} target="_blank" className="btn">
      {isMobile ? "Open in YouTube App" : "Watch on YouTube"}
    </a>
  );
}
```

### 4. Build Admin Panel

Create `app/admin/page.tsx` for:

- Login form
- Recipe management (CRUD)
- Ingredient management (CRUD)
- Import recipes from YouTube via Gemini

---

## 📚 Important Files

- **`prisma/schema.prisma`** - Database schema
- **`lib/prisma.ts`** - Prisma client singleton
- **`lib/adminAuth.ts`** - Admin authentication helper
- **`scripts/createAdmin.ts`** - Create new admin users
- **`scripts/migrateIngredientsToDb.ts`** - Import ingredients
- **`scripts/importRecipesToDb.ts`** - Import recipes from JSON
- **`DATABASE_GUIDE.md`** - Complete API documentation
- **`.env`** - Database connection string

---

## 🔐 Security Reminders

1. ⚠️ **Change admin password before production!**
2. ⚠️ Add `.env` to `.gitignore`
3. ⚠️ Use proper JWT tokens in production (not base64)
4. ⚠️ Add rate limiting to API routes
5. ⚠️ Enable CORS protection

---

## 🎯 What You Can Do Now

✅ All 1200 ingredients are searchable via `/api/ingredients`
✅ Recipe data is structured with relational links to ingredients
✅ Admin can add/edit/delete recipes and ingredients
✅ Users can search and view recipes with full blog content
✅ YouTube video integration ready
✅ Bilingual support (English & Bengali) throughout

---

## 📊 Current Database Status

- **Ingredients**: 1200 rows ✅
- **Recipes**: 1 row (Hyderabadi Chicken Masala) ✅
- **Admins**: 1 user (admin/admin123) ✅
- **API Routes**: 11 endpoints ✅

---

**Your database is fully operational! 🚀**

Start building your frontend components and import more recipes from YouTube using your Gemini extraction workflow!
