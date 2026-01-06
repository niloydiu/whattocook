import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function extractYouTubeId(url: string | undefined) {
  if (!url) return null;
  const m = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) || url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) || url.match(/\/vi?\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function normalizeRecipe(r: any) {
  const out: any = {};
  out.slug = r.slug || r.id || (r.title?.en && r.title.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) || `recipe-${Date.now()}`;
  out.title_en = (r.title?.en || r.title_en || r.title_en) || "Untitled";
  out.title_bn = (r.title?.bn || r.title_bn) || "";
  out.image = r.image || r.thumbnail || "";
  out.youtube_url = r.youtube_url || r.youtubeVideoLink || r.youtubeUrl || "";
  out.youtube_id = r.youtube_id || extractYouTubeId(out.youtube_url) || r.youtube_id || null;
  out.cuisine = Array.isArray(r.cuisine) ? r.cuisine.join(", ") : (r.cuisine || "");
  out.category = Array.isArray(r.category) ? r.category.join(", ") : (r.category || "Uncategorized");
  out.foodCategory = r.foodCategory || r.foodCategory || "Savory";
  out.difficulty = r.difficulty || "medium";
  out.prep_time = Number(r.prep_time ?? r.prepTime ?? 0) || 0;
  out.cook_time = Number(r.cook_time ?? r.cookTime ?? 0) || 0;
  out.servings = Number(r.servings ?? 1) || 1;
  out.createdAt = r.createdAt || new Date().toISOString();
  out.updatedAt = r.updatedAt || new Date().toISOString();

  // steps
  out.steps = (r.steps || r.steps || []).map((s: any, i: number) => ({
    step_number: s.step_number ?? s.stepNumber ?? i + 1,
    instruction_en: s.instruction?.en || s.instruction_en || s.instructionEn || (typeof s === 'string' ? s : ""),
    instruction_bn: s.instruction?.bn || s.instruction_bn || s.instructionBn || "",
    timestamp: s.timestamp || s.videoTimestamp || null,
  }));

  // ingredients (support both shapes)
  out.ingredients = (r.ingredients || []).map((ri: any) => {
    const ing = ri.ingredient || ri.name || {};
    return {
      quantity: ri.quantity || ri.quantityBn || ri.qty || "",
      unit_en: ri.unit_en || ri.unit || "",
      unit_bn: ri.unit_bn || "",
      notes_en: ri.notes?.en || ri.notes_en || null,
      notes_bn: ri.notes?.bn || ri.notes_bn || null,
      ingredient: {
        name_en: (ing?.en || ing?.name_en || ing?.name || (typeof ing === 'string' ? ing : "")).toString(),
        name_bn: (ing?.bn || ing?.name_bn || "").toString(),
        img: ing?.img || "",
        phonetic: ing?.phonetic || [],
      },
    };
  });

  out.blogContent = r.blogContent || r.blog_content || r.blogContent || null;
  out.tags = r.tags || [];

  return out;
}

async function main() {
  const inPath = path.join(process.cwd(), "data", "remote-recipes-backup.json");
  if (!fs.existsSync(inPath)) {
    console.error("No backup file found at", inPath);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(inPath, "utf-8"));
  console.log(`Found ${raw.length} recipes to normalize`);

  const cleaned: any[] = [];
  for (const r of raw) {
    const n = normalizeRecipe(r);
    cleaned.push(n);
  }

  const outPath = path.join(process.cwd(), "data", "remote-recipes-clean.json");
  fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2));
  console.log(`Wrote cleaned data to ${outPath}`);

  // Upsert into target DB if TARGET_DATABASE_URL is provided
  const target = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;
  if (!target) {
    console.log("No TARGET_DATABASE_URL/DATABASE_URL set — skipping DB upsert.");
    await prisma.$disconnect();
    return;
  }

  console.log("Upserting recipes to:", target.slice(0, 60) + "...");
  for (const r of cleaned) {
    // Upsert recipe
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
        updatedAt: new Date(),
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

    // clear and recreate steps
    await prisma.recipeStep.deleteMany({ where: { recipe_id: recipeId } });
    for (const s of r.steps) {
      await prisma.recipeStep.create({ data: {
        recipe_id: recipeId,
        step_number: s.step_number,
        instruction_en: s.instruction_en || "",
        instruction_bn: s.instruction_bn || "",
        timestamp: s.timestamp || null,
      }});
    }

    // ingredients: ensure ingredient exists then create recipeIngredient
    await prisma.recipeIngredient.deleteMany({ where: { recipe_id: recipeId } });
    for (const ri of r.ingredients) {
      const nameEn = ri.ingredient?.name_en || "";
      let existing = await prisma.ingredient.findFirst({ where: { name_en: nameEn } });
      if (!existing) {
        existing = await prisma.ingredient.create({ data: {
          name_en: nameEn || "",
          name_bn: ri.ingredient?.name_bn || "",
          img: ri.ingredient?.img || "",
          phonetic: ri.ingredient?.phonetic || [],
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

    // blog content
    await prisma.recipeBlogContent.deleteMany({ where: { recipe_id: recipeId } });
    if (r.blogContent) {
      await prisma.recipeBlogContent.create({ data: {
        recipe_id: recipeId,
        intro_en: r.blogContent.intro?.en || r.blogContent.intro_en || "",
        intro_bn: r.blogContent.intro?.bn || r.blogContent.intro_bn || "",
        what_makes_it_special_en: r.blogContent.whatMakesItSpecial?.en || r.blogContent.what_makes_it_special_en || "",
        what_makes_it_special_bn: r.blogContent.whatMakesItSpecial?.bn || r.blogContent.what_makes_it_special_bn || "",
        cooking_tips_en: r.blogContent.cookingTips?.en || r.blogContent.cooking_tips_en || "",
        cooking_tips_bn: r.blogContent.cookingTips?.bn || r.blogContent.cooking_tips_bn || "",
        serving_en: r.blogContent.servingSuggestions?.en || r.blogContent.serving_en || "",
        serving_bn: r.blogContent.servingSuggestions?.bn || r.blogContent.serving_bn || "",
        storage_en: r.blogContent.storage?.en || r.blogContent.storage_en || null,
        storage_bn: r.blogContent.storage?.bn || r.blogContent.storage_bn || null,
        full_blog_en: r.blogContent.fullBlogText?.en || r.blogContent.full_blog_en || "",
        full_blog_bn: r.blogContent.fullBlogText?.bn || r.blogContent.full_blog_bn || "",
      }});
    }
  }

  console.log("Upsert complete.");
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
