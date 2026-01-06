# Food Categories Reference Guide

## Available Food Categories

The application supports the following food categories:

| Category | English | Bengali | Description | Use Cases |
|----------|---------|---------|-------------|-----------|
| **Savory** | Savory | ঝাল/নোনতা | Default category for non-sweet dishes | Most curries, main courses, rice dishes |
| **Sweet** | Sweet | মিষ্টি | Sweet dishes and desserts | Rasgulla, Sandesh, Payesh, Sweet Rice |
| **Spicy** | Spicy | ঝাল | Hot and spicy dishes | Spicy curries, hot appetizers, chili-based dishes |
| **Sour** | Sour | টক | Tangy or sour dishes | Tok dal, sour curries, pickles |
| **Dessert** | Dessert | ডেজার্ট | Dedicated dessert category | Cakes, puddings, ice cream, western desserts |
| **Drinks** | Drinks | পানীয় | Beverages | Lassi, tea, coffee, smoothies, mocktails |
| **Appetizer** | Appetizer | অ্যাপেটাইজার | Starters and snacks | Samosas, pakoras, chaat, rolls |
| **Soup** | Soup | স্যুপ | All types of soups | Vegetable soup, chicken soup, lentil soup |
| **Salad** | Salad | সালাদ | Fresh salads | Green salad, fruit salad, mixed vegetable salad |

## Database Schema

```prisma
model Recipe {
  // ... other fields ...
  foodCategory String? @default("Savory")
  
  @@index([foodCategory])
}
```

## API Usage

### Filtering Recipes by Category

```javascript
// GET request
fetch('/api/recipes?foodCategory=Sweet')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Creating Recipe with Category

```javascript
// In recipe submission form
const recipeData = {
  title_en: "Rasgulla",
  title_bn: "রসগোল্লা",
  foodCategory: "Sweet",  // <-- Category field
  // ... other fields
};
```

## UI Display

### Recipe Cards
- Food category appears as a **gradient badge** (purple to pink)
- Position: **Bottom-left** of recipe image
- Font: **Bold, white text**
- Shadow: **Large drop shadow** for visibility

```tsx
{recipe.foodCategory && (
  <div className="absolute bottom-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
    {recipe.foodCategory}
  </div>
)}
```

### Recipe Detail Page
- Appears alongside difficulty, cuisine, and category badges
- Same gradient purple/pink styling
- Full rounded pill shape

```tsx
{recipe.foodCategory && (
  <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-sm shadow-lg">
    {recipe.foodCategory}
  </span>
)}
```

## Form Integration

### Submit Recipe Form
The food category dropdown in the recipe submission form:

```tsx
<select
  value={formData.foodCategory}
  onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none transition-colors"
>
  <option value="Savory">Savory / ঝাল/নোনতা</option>
  <option value="Sweet">Sweet / মিষ্টি</option>
  <option value="Spicy">Spicy / ঝাল</option>
  <option value="Sour">Sour / টক</option>
  <option value="Dessert">Dessert / ডেজার্ট</option>
  <option value="Drinks">Drinks / পানীয়</option>
  <option value="Appetizer">Appetizer / অ্যাপেটাইজার</option>
  <option value="Soup">Soup / স্যুপ</option>
  <option value="Salad">Salad / সালাদ</option>
</select>
```

## Color Scheme

The gradient used for food categories:
- **Background**: `from-purple-500 to-pink-500`
- **Hex Values**: 
  - Purple: `#a855f7` (purple-500)
  - Pink: `#ec4899` (pink-500)
- **Text**: White (`#ffffff`)
- **Shadow**: `shadow-lg` (large box shadow)

## Default Behavior

### New Recipes
- All new recipes default to `"Savory"` if no category is specified
- This is set at the database level with `@default("Savory")`

### Existing Recipes
- Existing recipes without a category will show `null` or `"Savory"` depending on database migration
- Category badge only displays if `foodCategory` field has a value

### Optional Field
- Food category is **optional** (`String?` in schema)
- Recipes can exist without a category
- UI handles missing categories gracefully (no badge shown)

## Filtering Best Practices

### Frontend Filtering
```tsx
const filteredRecipes = recipes.filter(recipe => 
  recipe.foodCategory === selectedCategory
);
```

### API Filtering
```tsx
// More efficient - filters at database level
const response = await fetch(`/api/recipes?foodCategory=${selectedCategory}`);
```

## Future Enhancements

Potential improvements for the food category system:

1. **Category Browsing Page**
   - Dedicated page showing all categories
   - Click category to see all recipes in that category

2. **Category Filter on Main Page**
   - Dropdown or chip buttons for category filtering
   - Combine with existing ingredient search

3. **Multiple Categories**
   - Allow recipes to have multiple categories
   - E.g., "Sweet & Spicy", "Dessert & Drinks"
   - Would require schema change from `String?` to `String[]`

4. **Category Icons**
   - Add icons for each category (🍰 for dessert, 🌶️ for spicy, etc.)
   - Display alongside category name

5. **Category Statistics**
   - Show recipe count per category
   - Most popular categories
   - Category-based recommendations

6. **Category Translations**
   - Store category names in both EN and BN in database
   - More consistent bilingual support
   - Example: `{name_en: "Sweet", name_bn: "মিষ্টি"}`

## Migration Guide

### Adding Category to Existing Recipe

Using Prisma Studio:
```bash
npx prisma studio
```
1. Open Recipe table
2. Find the recipe
3. Edit `foodCategory` field
4. Select from: Savory, Sweet, Spicy, Sour, Dessert, Drinks, Appetizer, Soup, Salad
5. Save

Using API:
```bash
curl -X PATCH http://localhost:3000/api/admin/recipes/[id] \
  -H "Content-Type: application/json" \
  -d '{"foodCategory": "Sweet"}'
```

### Bulk Update
Using Prisma CLI:
```bash
npx prisma db execute --file update-categories.sql
```

Sample SQL:
```sql
-- Update all dessert recipes
UPDATE "Recipe" 
SET "foodCategory" = 'Dessert' 
WHERE "category" LIKE '%Dessert%';

-- Update all drinks
UPDATE "Recipe" 
SET "foodCategory" = 'Drinks' 
WHERE "category" LIKE '%Drink%' OR "category" LIKE '%Beverage%';
```

---

**Last Updated**: January 6, 2026  
**Schema Version**: v2.0 (with foodCategory field)
