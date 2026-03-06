import { z } from "zod/v4";

// ─── Recipe Import (from Gemini AI output) ─────────────────────────────────

export const RecipeImportSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly lowercase with hyphens"),
  title_en: z.string().min(3, "English title too short").max(200),
  title_bn: z.string().min(3, "Bengali title too short").max(200),
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
  })).min(1, "At least one ingredient required"),
  steps: z.array(z.object({
    step_number: z.number().int().min(1),
    instruction_en: z.string().min(5),
    instruction_bn: z.string().min(5),
    timestamp: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
  })).min(1, "At least one step required"),
  blogContent: z.object({
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

export type RecipeImport = z.infer<typeof RecipeImportSchema>;

// ─── Auto-fix common AI output issues before validation ─────────────────────

const FOOD_CATEGORY_MAP: Record<string, string> = {
  "savory": "Savory", "savoury": "Savory",
  "sweet": "Sweet", "dessert": "Dessert", "desserts": "Dessert",
  "spicy": "Spicy", "sour": "Sour",
  "drinks": "Drinks", "drink": "Drinks", "beverage": "Drinks", "beverages": "Drinks",
  "appetizer": "Appetizer", "appetizers": "Appetizer", "starter": "Appetizer",
  "soup": "Soup", "soups": "Soup",
  "salad": "Salad", "salads": "Salad",
};

const DIFFICULTY_MAP: Record<string, string> = {
  "easy": "Easy", "simple": "Easy", "beginner": "Easy",
  "medium": "Medium", "moderate": "Medium", "intermediate": "Medium",
  "hard": "Hard", "difficult": "Hard", "advanced": "Hard",
};

export function autoFixRecipeImport(data: Record<string, unknown>): { fixed: Record<string, unknown>; warnings: string[] } {
  const fixed = { ...data };
  const warnings: string[] = [];

  // Fix slug
  if (typeof fixed.slug === "string") {
    fixed.slug = fixed.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  // Fix foodCategory
  if (typeof fixed.foodCategory === "string") {
    const normalized = fixed.foodCategory.toLowerCase().trim();
    if (FOOD_CATEGORY_MAP[normalized]) {
      if (fixed.foodCategory !== FOOD_CATEGORY_MAP[normalized]) {
        warnings.push(`foodCategory "${fixed.foodCategory}" auto-corrected to "${FOOD_CATEGORY_MAP[normalized]}"`);
      }
      fixed.foodCategory = FOOD_CATEGORY_MAP[normalized];
    }
  }

  // Fix difficulty
  if (typeof fixed.difficulty === "string") {
    const normalized = fixed.difficulty.toLowerCase().trim();
    if (DIFFICULTY_MAP[normalized]) {
      if (fixed.difficulty !== DIFFICULTY_MAP[normalized]) {
        warnings.push(`difficulty "${fixed.difficulty}" auto-corrected to "${DIFFICULTY_MAP[normalized]}"`);
      }
      fixed.difficulty = DIFFICULTY_MAP[normalized];
    }
  }

  // Trim whitespace from string fields
  for (const key of ["title_en", "title_bn", "cuisine", "category"]) {
    if (typeof fixed[key] === "string") {
      fixed[key] = (fixed[key] as string).trim();
    }
  }

  // Coerce numeric strings to numbers
  for (const key of ["prep_time", "cook_time", "servings"]) {
    if (typeof fixed[key] === "string") {
      const num = parseInt(fixed[key] as string, 10);
      if (!isNaN(num)) {
        warnings.push(`${key} was string "${fixed[key]}", converted to number ${num}`);
        fixed[key] = num;
      }
    }
  }

  return { fixed, warnings };
}

// ─── Admin Login ─────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// ─── Recipe Creation (admin) ─────────────────────────────────────────────────

export const RecipeCreateSchema = z.object({
  slug: z.string().min(1),
  title_en: z.string().min(1),
  title_bn: z.string().min(1),
  image: z.string().url().optional(),
  youtube_url: z.string().url().optional(),
  youtube_id: z.string().optional(),
  cuisine: z.string().min(1),
  category: z.string().min(1),
  foodCategory: z.string().optional(),
  difficulty: z.string().min(1),
  prep_time: z.number().int().min(0),
  cook_time: z.number().int().min(0),
  servings: z.number().int().min(1),
  ingredients: z.array(z.object({
    name_en: z.string().optional(),
    name_bn: z.string().optional(),
    ingredient_id: z.number().optional(),
    quantity: z.string(),
    unit_en: z.string(),
    unit_bn: z.string(),
    notes_en: z.string().optional(),
    notes_bn: z.string().optional(),
  })).min(1),
  steps: z.array(z.object({
    step_number: z.number().int().min(1),
    instruction_en: z.string().min(1),
    instruction_bn: z.string().min(1),
    timestamp: z.string().optional(),
  })).min(1),
  blogContent: z.object({
    intro_en: z.string(),
    intro_bn: z.string(),
    what_makes_it_special_en: z.string(),
    what_makes_it_special_bn: z.string(),
    cooking_tips_en: z.string(),
    cooking_tips_bn: z.string(),
    serving_en: z.string(),
    serving_bn: z.string(),
    storage_en: z.string().optional(),
    storage_bn: z.string().optional(),
    full_blog_en: z.string(),
    full_blog_bn: z.string(),
  }).optional(),
});

// ─── Ingredient ──────────────────────────────────────────────────────────────

export const IngredientCreateSchema = z.object({
  name_en: z.string().min(1, "English name is required"),
  name_bn: z.string().min(1, "Bengali name is required"),
  img: z.string().optional(),
  phonetic: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
});

export const IngredientUpdateSchema = z.object({
  name_en: z.string().min(1).optional(),
  name_bn: z.string().min(1).optional(),
  img: z.string().optional(),
  phonetic: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
});

// ─── Recipe Request ──────────────────────────────────────────────────────────

export const RecipeRequestSchema = z.object({
  requestType: z.enum(["submit", "by-ingredients", "by-name"]),
  title: z.string().optional(),
  description: z.string().optional(),
  userEmail: z.string().email().optional().or(z.literal("")),
  userName: z.string().optional(),
  recipeData: z.record(z.string(), z.unknown()).optional(),
  ingredients: z.array(z.string()).optional(),
  recipeName: z.string().optional(),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
});

// ─── Recipe Report ───────────────────────────────────────────────────────────

export const ReportSchema = z.object({
  recipeId: z.number().int(),
  reporterName: z.string().optional(),
  reporterEmail: z.string().email().optional().or(z.literal("")),
  reason: z.string().min(1, "Reason is required"),
  details: z.string().optional(),
});

// ─── Rating ──────────────────────────────────────────────────────────────────

export const RatingSchema = z.object({
  score: z.number().int().min(1).max(5),
  review: z.string().max(2000).optional(),
});

// ─── Search ──────────────────────────────────────────────────────────────────

export const SearchByIngredientsSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1, "At least one ingredient required").max(30),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  excludeAllergens: z.array(z.number().int()).optional(),
});

// ─── Ingredient Merge ────────────────────────────────────────────────────────

export const IngredientMergeSchema = z.object({
  sourceId: z.number().int(),
  targetId: z.number().int(),
});

// ─── Cooking Progress ────────────────────────────────────────────────────────

export const CookingStartSchema = z.object({
  recipeId: z.number().int(),
});

export const CookingStepUpdateSchema = z.object({
  stepNumber: z.number().int().min(1),
  isCompleted: z.boolean(),
});

export const CookingIngredientUpdateSchema = z.object({
  ingredientId: z.number().int(),
  isHave: z.boolean(),
});

// ─── Helper: validate request body ──────────────────────────────────────────

export function validateBody<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return { success: false, errors };
}
