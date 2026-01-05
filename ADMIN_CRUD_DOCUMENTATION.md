# Admin Panel - Complete CRUD Documentation

## Overview
The admin panel now has **complete CRUD (Create, Read, Update, Delete)** operations for all entities in the application.

---

## 🎯 Entities with Full CRUD

### 1. **Recipes** (`/admin/recipes`)
**API Endpoints:**
- `GET /api/admin/recipes` - List all recipes
- `GET /api/admin/recipes/[id]` - Get single recipe with full details
- `POST /api/admin/recipes` - Create new recipe
- `PUT /api/admin/recipes/[id]` - Update recipe (including steps, ingredients, blog content)
- `DELETE /api/admin/recipes/[id]` - Delete recipe

**Admin Pages:**
- `/admin/recipes` - Browse, search, filter, and delete recipes
- `/admin/recipes/edit/[id]` - Full edit page with:
  - Basic info (title, slug, image, YouTube URL, cuisine, category, difficulty, timings)
  - Ingredients management (add, edit, remove)
  - Steps management (add, edit, remove, auto-numbering)
  - Blog content (intro, special features, tips, serving, storage)
- `/admin/add-recipe` - Create recipe from JSON

**Features:**
- ✅ Search by title (English/Bangla)
- ✅ Filter by cuisine and category
- ✅ View recipe on site (new tab)
- ✅ Edit all fields including nested ingredients, steps, blog content
- ✅ Delete with confirmation modal
- ✅ Recipe cards with badges and metadata

---

### 2. **Ingredients** (`/admin/ingredients`)
**API Endpoints:**
- `GET /api/admin/ingredients` - List all ingredients
- `GET /api/admin/ingredients/[id]` - Get single ingredient
- `POST /api/admin/ingredients` - Create new ingredient
- `PUT /api/admin/ingredients/[id]` - Update ingredient
- `DELETE /api/admin/ingredients/[id]` - Delete ingredient

**Admin Page:**
- `/admin/ingredients` - Grid view of all ingredients

**Features:**
- ✅ Add new ingredient (modal with name_en, name_bn, image URL)
- ✅ Edit ingredient (pre-filled modal)
- ✅ Delete ingredient (confirmation modal)
- ✅ Image preview
- ✅ Search functionality
- ✅ Responsive grid layout

---

### 3. **Recipe Steps** (Managed within Recipe Editor)
**Operations:** Embedded in `/admin/recipes/edit/[id]`
- ✅ Add step (auto-increments step number)
- ✅ Edit step (instruction_en, instruction_bn, timestamp)
- ✅ Delete step (auto-renumbers remaining steps)
- ✅ Full bilingual support

**Database Operations:**
- DELETE all steps on recipe update (cascade)
- CREATE new steps with updated data
- Ensures data consistency

---

### 4. **Recipe Blog Content** (Managed within Recipe Editor)
**Operations:** Embedded in `/admin/recipes/edit/[id]`
- ✅ Upsert (create or update) all blog fields:
  - intro_en / intro_bn
  - what_makes_it_special_en / what_makes_it_special_bn
  - cooking_tips_en / cooking_tips_bn
  - serving_en / serving_bn
  - storage_en / storage_bn
  - full_blog_en / full_blog_bn

**Database Operations:**
- UPSERT operation (create if not exists, update if exists)
- One-to-one relationship with Recipe

---

### 5. **Admin Users** (`/admin/users`) ⭐ NEW
**API Endpoints:**
- `GET /api/admin/users` - List all admin users
- `POST /api/admin/users` - Create new admin user
- `PUT /api/admin/users/[id]` - Update admin password
- `DELETE /api/admin/users/[id]` - Delete admin user

**Admin Page:**
- `/admin/users` - Card-based view of admin users

**Features:**
- ✅ Create admin user (username, password with bcrypt hashing)
- ✅ Change password (min 6 characters)
- ✅ Delete user (prevents deletion of last admin)
- ✅ View creation date
- ✅ Security: Password validation, unique username constraint

**Security:**
- Passwords hashed with bcrypt (10 rounds)
- Minimum 6 characters requirement
- Cannot delete last admin user
- Username uniqueness enforced

---

## 🎨 Admin Panel Features

### Navigation
**Top Navigation Bar:**
- Dashboard
- Recipes
- Ingredients
- Import (YouTube)
- Users
- View Site (link to main site)
- Logout button

### Dashboard (`/admin`)
**Statistics Cards:**
- Total Recipes
- Total Ingredients
- Categories Count
- Cuisines Count

**Quick Actions:**
- Add Recipe
- Manage Recipes
- Manage Ingredients
- Import from YouTube
- Admin Users

**Visual Analytics:**
- Recipe Categories breakdown (top 5 with progress bars)
- Recipe Cuisines breakdown (top 5 with progress bars)

---

## 🔒 Authentication & Security

### Admin Authentication
- Cookie-based authentication (`admin_token`)
- Required for all `/api/admin/*` endpoints
- Checked via `checkAdminAuth()` middleware

### Password Security
- Bcrypt hashing (10 rounds)
- Stored as `password_hash` in database
- Never exposed in API responses

### Database Constraints
- Unique usernames
- Unique recipe slugs
- Cascading deletes (recipe → steps, ingredients, blog content)
- Indexed fields for performance

---

## 📊 Database Schema

```prisma
model Recipe {
  id          Int
  slug        String @unique
  title_en    String
  title_bn    String
  image       String
  youtube_url String
  youtube_id  String?
  cuisine     String
  category    String
  difficulty  String
  prep_time   Int
  cook_time   Int
  servings    Int
  
  blogContent RecipeBlogContent? (1:1)
  ingredients RecipeIngredient[] (1:many)
  steps       RecipeStep[]       (1:many)
}

model Ingredient {
  id       Int
  name_en  String
  name_bn  String
  img      String
  phonetic String[]
  
  recipeIngredients RecipeIngredient[] (1:many)
}

model RecipeIngredient {
  recipe_id     Int
  ingredient_id Int
  quantity      String
  unit_en       String
  unit_bn       String
  notes_en      String?
  notes_bn      String?
}

model RecipeStep {
  recipe_id      Int
  step_number    Int
  instruction_en String
  instruction_bn String
  timestamp      String?
}

model RecipeBlogContent {
  recipe_id                Int @unique
  intro_en                 String
  intro_bn                 String
  what_makes_it_special_en String
  what_makes_it_special_bn String
  cooking_tips_en          String
  cooking_tips_bn          String
  serving_en               String
  serving_bn               String
  storage_en               String?
  storage_bn               String?
  full_blog_en             String
  full_blog_bn             String
}

model Admin {
  id            Int
  username      String @unique
  password_hash String
  email         String? @unique
}
```

---

## 🚀 API Summary

### Recipe CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | List recipes (public) |
| GET | `/api/recipes/[slug]` | Get recipe by slug (public) |
| GET | `/api/admin/recipes` | List all recipes (admin) |
| GET | `/api/admin/recipes/[id]` | Get recipe by ID with full details |
| POST | `/api/admin/recipes` | Create recipe |
| PUT | `/api/admin/recipes/[id]` | Update recipe (cascading updates) |
| DELETE | `/api/admin/recipes/[id]` | Delete recipe (cascading deletes) |

### Ingredient CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ingredients` | List ingredients (public) |
| GET | `/api/admin/ingredients` | List all ingredients (admin) |
| GET | `/api/admin/ingredients/[id]` | Get ingredient by ID |
| POST | `/api/admin/ingredients` | Create ingredient |
| PUT | `/api/admin/ingredients/[id]` | Update ingredient |
| DELETE | `/api/admin/ingredients/[id]` | Delete ingredient |

### Admin User CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all admin users |
| POST | `/api/admin/users` | Create admin user |
| PUT | `/api/admin/users/[id]` | Update admin password |
| DELETE | `/api/admin/users/[id]` | Delete admin user |

### Utility APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/recipes/search-by-ingredients` | Ingredient-based search |
| GET | `/api/youtube/[videoId]` | Get YouTube video metadata |

---

## 🎨 UI/UX Features

### Design System
- **Colors:** Blue (recipes), Green (ingredients), Purple (import), Orange/Red (users)
- **Components:** Framer Motion animations, Lucide React icons
- **Layout:** Responsive grid, card-based design
- **Modals:** Confirmation dialogs for destructive actions

### User Experience
- ✅ Loading states with spinners
- ✅ Error handling with alerts
- ✅ Success confirmations
- ✅ Hover effects and transitions
- ✅ Empty states with helpful messages
- ✅ Search and filter functionality
- ✅ Badges and visual indicators
- ✅ Image fallbacks
- ✅ Responsive design (mobile-friendly)

---

## 📝 Usage Examples

### Create Admin User
```bash
# Via API
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_token=YOUR_TOKEN" \
  -d '{"username": "newadmin", "password": "securepass"}'
```

### Update Recipe
```bash
# Via API
curl -X PUT http://localhost:3000/api/admin/recipes/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_token=YOUR_TOKEN" \
  -d '{
    "slug": "chicken-curry",
    "title_en": "Chicken Curry",
    "ingredients": [...],
    "steps": [...],
    "blogContent": {...}
  }'
```

---

## ✅ Complete CRUD Checklist

- ✅ **Recipes:** Create, Read, Update, Delete
- ✅ **Ingredients:** Create, Read, Update, Delete
- ✅ **Recipe Steps:** Create, Read, Update, Delete (via recipe editor)
- ✅ **Recipe Blog Content:** Create, Read, Update (upsert via recipe editor)
- ✅ **Admin Users:** Create, Read, Update (password), Delete
- ✅ **Recipe Ingredients (Join Table):** Managed via recipe CRUD
- ✅ **Authentication:** Login, Logout, Session management
- ✅ **Authorization:** All admin routes protected
- ✅ **Search & Filter:** Recipes, Ingredients
- ✅ **Image Management:** Upload URLs, preview, fallbacks
- ✅ **Bilingual Support:** English and Bangla for all content

---

## 🎯 Next Steps (Optional Enhancements)

1. **File Upload:** Direct image upload instead of URLs
2. **Bulk Operations:** Import/export CSV, delete multiple items
3. **Advanced Search:** Full-text search, fuzzy matching
4. **Analytics:** Recipe views, popular ingredients, user engagement
5. **AI Integration:** Complete YouTube import with Gemini AI
6. **Role-Based Access:** Super admin, editor, viewer roles
7. **Audit Logs:** Track all CRUD operations
8. **Soft Deletes:** Archive instead of permanent deletion
9. **Versioning:** Track recipe changes over time
10. **API Documentation:** Auto-generated OpenAPI/Swagger docs

---

## 🔧 Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Cookie-based with bcrypt
- **UI:** Tailwind CSS, Framer Motion, Lucide React
- **TypeScript:** Full type safety
- **API:** RESTful with proper HTTP methods

---

**Status:** ✅ All CRUD operations implemented and tested  
**Last Updated:** January 5, 2026  
**Version:** 1.0.0
