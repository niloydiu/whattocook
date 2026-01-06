import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// TARGET_DATABASE_URL should be provided in env or default to the common local URL
const TARGET = process.env.TARGET_DATABASE_URL || "postgresql://niloy@localhost:5432/whattocook?schema=public";

// Set DATABASE_URL for Prisma client to TARGET before importing
process.env.DATABASE_URL = TARGET;

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const inPath = path.join(process.cwd(), "data", "remote-recipes-backup.json");
  if (!fs.existsSync(inPath)) {
    console.error("Backup file not found:", inPath);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(inPath, "utf-8"));
  console.log(`Importing ${raw.length} recipes into target DB: ${TARGET.slice(0, 60)}...`);

  for (const r of raw) {
    // Upsert recipe basic fields
    const upserted = await prisma.recipe.upsert({
      where: { slug: r.slug },
      update: {
        title_en: r.title_en,
        title_bn: r.title_bn,
        image: r.image,
        youtube_url: r.youtube_url,
        youtube_id: r.youtube_id,
        cuisine: r.cuisine,
        category: r.category,
        foodCategory: r.foodCategory,
        difficulty: r.difficulty,
        prep_time: r.prep_time,
        cook_time: r.cook_time,
        servings: r.servings,
      },
      create: {
        slug: r.slug,
        title_en: r.title_en,
        title_bn: r.title_bn,
        image: r.image,
        youtube_url: r.youtube_url,
        youtube_id: r.youtube_id,
        cuisine: r.cuisine,
        category: r.category,
        foodCategory: r.foodCategory,
        difficulty: r.difficulty,
        prep_time: r.prep_time,
        cook_time: r.cook_time,
        servings: r.servings,
      },
    });

    const recipeId = upserted.id;

    // Remove existing steps and recipeIngredients and blogContent for this recipe
    await prisma.recipeStep.deleteMany({ where: { recipe_id: recipeId } });
    await prisma.recipeIngredient.deleteMany({ where: { recipe_id: recipeId } });
    await prisma.recipeBlogContent.deleteMany({ where: { recipe_id: recipeId } });

    // Recreate steps
    if (Array.isArray(r.steps) && r.steps.length) {
      const stepsData = r.steps.map((s: any) => ({
        recipe_id: recipeId,
        step_number: s.step_number,
        instruction_en: s.instruction_en,
        instruction_bn: s.instruction_bn,
        timestamp: s.timestamp,
      }));
      for (const s of stepsData) {
        await prisma.recipeStep.create({ data: s });
      }
    }

    // Recreate ingredients (ensure Ingredient exists then create RecipeIngredient)
    if (Array.isArray(r.ingredients) && r.ingredients.length) {
      for (const ri of r.ingredients) {
        const ing = ri.ingredient || ri;
        // Try find by name_en then create if not exists
        let existing = await prisma.ingredient.findFirst({ where: { name_en: ing.name_en } });
        if (!existing) {
          existing = await prisma.ingredient.create({ data: {
            name_en: ing.name_en || "",
            name_bn: ing.name_bn || "",
            img: ing.img || "",
            phonetic: ing.phonetic || [],
          }});
        }

        await prisma.recipeIngredient.create({ data: {
          recipe_id: recipeId,
          ingredient_id: existing.id,
          quantity: ri.quantity || "",
          unit_en: ri.unit_en || "",
          unit_bn: ri.unit_bn || "",
          notes_en: ri.notes_en || null,
          notes_bn: ri.notes_bn || null,
        }});
      }
    }

    // Recreate blogContent if present
    if (r.blogContent) {
      const bc = r.blogContent;
      await prisma.recipeBlogContent.create({ data: {
        recipe_id: recipeId,
        intro_en: bc.intro_en || "",
        intro_bn: bc.intro_bn || "",
        what_makes_it_special_en: bc.what_makes_it_special_en || "",
        what_makes_it_special_bn: bc.what_makes_it_special_bn || "",
        cooking_tips_en: bc.cooking_tips_en || "",
        cooking_tips_bn: bc.cooking_tips_bn || "",
        serving_en: bc.serving_en || "",
        serving_bn: bc.serving_bn || "",
        storage_en: bc.storage_en || null,
        storage_bn: bc.storage_bn || null,
        full_blog_en: bc.full_blog_en || "",
        full_blog_bn: bc.full_blog_bn || "",
      }});
    }
  }

  console.log("Import complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
