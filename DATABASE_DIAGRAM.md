# 📊 Database Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     WhatToCook Database                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   Ingredient        │  (1200 rows - all your ingredients)
├─────────────────────┤
│ id          PK      │◄─────┐
│ name_en     String  │      │
│ name_bn     String  │      │
│ img         String  │      │ Many-to-Many
│ phonetic[]  String[]│      │ Relationship
│ createdAt   DateTime│      │
│ updatedAt   DateTime│      │
└─────────────────────┘      │
                             │
                    ┌────────┴──────────────┐
                    │                       │
            ┌───────▼──────────┐   ┌────────▼────────┐
            │ RecipeIngredient │   │     Recipe      │
            ├──────────────────┤   ├─────────────────┤
            │ id          PK   │   │ id          PK  │
            │ recipe_id   FK   │◄──┤ slug      UNIQUE│
            │ ingredient_id FK │   │ title_en        │
            │ quantity         │   │ title_bn        │
            │ unit_en          │   │ image           │
            │ unit_bn          │   │ youtube_url     │
            │ notes_en         │   │ youtube_id      │
            │ notes_bn         │   │ cuisine         │
            └──────────────────┘   │ category        │
                                   │ difficulty      │
                                   │ prep_time       │
                                   │ cook_time       │
                                   │ servings        │
                                   │ createdAt       │
                                   │ updatedAt       │
                                   └─────────┬───────┘
                                             │
                                    ┌────────┴────────┐
                                    │                 │
                        ┌───────────▼─────┐  ┌────────▼───────────┐
                        │  RecipeStep     │  │ RecipeBlogContent  │
                        ├─────────────────┤  ├────────────────────┤
                        │ id          PK  │  │ id             PK  │
                        │ recipe_id   FK  │  │ recipe_id      FK  │
                        │ step_number     │  │ intro_en           │
                        │ instruction_en  │  │ intro_bn           │
                        │ instruction_bn  │  │ what_makes_it_     │
                        │ timestamp       │  │   special_en/bn    │
                        └─────────────────┘  │ cooking_tips_en/bn │
                                             │ serving_en/bn      │
                                             │ storage_en/bn      │
                                             │ full_blog_en/bn    │
                                             └────────────────────┘

┌─────────────────────┐
│      Admin          │  (Admin users for authentication)
├─────────────────────┤
│ id          PK      │
│ username    UNIQUE  │
│ password_hash       │
│ email       UNIQUE  │
│ createdAt   DateTime│
│ updatedAt   DateTime│
└─────────────────────┘
```

## How Data Flows

### 1️⃣ **User Searches for Recipe**

```
User → /api/recipes?search=chicken
  ↓
Query Recipe table (title_en, title_bn)
  ↓
Return recipe cards (id, slug, title, image, etc.)
```

### 2️⃣ **User Views Recipe Details**

```
User → /api/recipes/hyderabadi-chicken-masala
  ↓
Find Recipe by slug
  ↓
JOIN with RecipeIngredient
  ↓
JOIN with Ingredient (get ingredient details)
  ↓
JOIN with RecipeStep (get cooking steps)
  ↓
JOIN with RecipeBlogContent (get blog sections)
  ↓
Return complete recipe with:
  - Basic info (title, image, YouTube URL)
  - List of ingredients (with images, quantities)
  - Step-by-step instructions (with timestamps)
  - Full blog content (intro, tips, serving, etc.)
```

### 3️⃣ **Admin Creates New Recipe**

```
Admin → POST /api/admin/recipes (with Bearer token)
  ↓
Validate admin token
  ↓
Create Recipe (returns recipe_id)
  ↓
Create RecipeIngredients (links to existing ingredients)
  ↓
Create RecipeSteps
  ↓
Create RecipeBlogContent
  ↓
Return complete recipe object
```

## Data Example

### Recipe: Hyderabadi Chicken Masala

```
Recipe (1 row)
├── id: 1
├── slug: "hyderabadi-chicken-masala"
├── title_en: "Hyderabadi Chicken Masala"
├── youtube_id: "QamJu5u___Y"
└── ... other metadata

RecipeIngredients (21 rows linked to recipe_id=1)
├── { recipe_id: 1, ingredient_id: 1,  quantity: "2 kg" }    → Chicken
├── { recipe_id: 1, ingredient_id: 6,  quantity: "1 tbsp" }  → Ginger
├── { recipe_id: 1, ingredient_id: 5,  quantity: "1 tbsp" }  → Garlic
└── ... 18 more ingredient links

RecipeSteps (7 rows linked to recipe_id=1)
├── Step 1: "Heat oil..." at timestamp "0:30"
├── Step 2: "Add onions..." at timestamp "1:15"
└── ... 5 more steps

RecipeBlogContent (1 row linked to recipe_id=1)
├── intro_en: "This Hyderabadi recipe..."
├── cooking_tips_bn: "রান্নার সময়..."
└── ... all blog sections
```

## Indexes for Performance

```sql
-- Recipe searches
CREATE INDEX idx_recipes_slug ON Recipe(slug);
CREATE INDEX idx_recipes_title_en ON Recipe(title_en);
CREATE INDEX idx_recipes_cuisine ON Recipe(cuisine);

-- Ingredient searches
CREATE INDEX idx_ingredients_name_en ON Ingredient(name_en);
CREATE INDEX idx_ingredients_name_bn ON Ingredient(name_bn);

-- Junction table lookups
CREATE INDEX idx_recipe_ingredients_recipe_id ON RecipeIngredient(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON RecipeIngredient(ingredient_id);

-- Step ordering
CREATE INDEX idx_recipe_steps_recipe_id ON RecipeStep(recipe_id);
```

All these indexes are automatically created by Prisma! ✨

## Key Features

✅ **Relational Integrity**: Recipe ingredients always reference valid ingredients
✅ **Cascade Deletes**: Deleting a recipe automatically deletes its steps, ingredients, and blog content
✅ **Bilingual Support**: All text fields have English (\_en) and Bengali (\_bn) versions
✅ **Fast Searches**: Indexed fields for quick lookups
✅ **YouTube Integration**: Direct video ID and URL storage for embedding
✅ **Flexible Blog Content**: Structured sections that can be displayed in various layouts
