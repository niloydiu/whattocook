import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

async function importRecipe(filePath: string) {
  console.log(`Importing recipe from ${filePath}...`);

  const recipeData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  try {
    const recipe = await prisma.recipe.create({
      data: {
        slug: recipeData.slug,
        title_en: recipeData.title.en,
        title_bn: recipeData.title.bn,
        image: recipeData.thumbnail || "",
        youtube_url: recipeData.youtubeVideoLink,
        youtube_id: recipeData.videoId,
        cuisine: Array.isArray(recipeData.cuisine)
          ? recipeData.cuisine.join(", ")
          : recipeData.cuisine || "Indian",
        category: Array.isArray(recipeData.category)
          ? recipeData.category.join(", ")
          : recipeData.category || "Main Course",
        difficulty: recipeData.difficulty || "medium",
        prep_time: recipeData.prepTime || 30,
        cook_time: recipeData.cookTime || 30,
        servings: recipeData.servings || 4,
        ingredients: {
          create: recipeData.ingredients.map((ing: any) => ({
            ingredient_id: parseInt(ing.ingredientId),
            quantity: ing.quantity || ing.quantityBn || "",
            unit_en: "",
            unit_bn: "",
            notes_en: ing.notes?.en || "",
            notes_bn: ing.notes?.bn || "",
          })),
        },
        steps: {
          create:
            recipeData.steps?.map((step: any, index: number) => ({
              step_number: index + 1,
              instruction_en: step.instruction?.en || step.instructionEn || "",
              instruction_bn: step.instruction?.bn || step.instructionBn || "",
              timestamp: step.timestamp || "",
            })) || [],
        },
        blogContent: recipeData.blogContent
          ? {
              create: {
                intro_en: recipeData.blogContent.intro?.en || "",
                intro_bn: recipeData.blogContent.intro?.bn || "",
                what_makes_it_special_en:
                  recipeData.blogContent.whatMakesItSpecial?.en ||
                  recipeData.description?.en ||
                  "",
                what_makes_it_special_bn:
                  recipeData.blogContent.whatMakesItSpecial?.bn ||
                  recipeData.description?.bn ||
                  "",
                cooking_tips_en: recipeData.blogContent.cookingTips?.en || "",
                cooking_tips_bn: recipeData.blogContent.cookingTips?.bn || "",
                serving_en: recipeData.blogContent.servingSuggestions?.en || "",
                serving_bn: recipeData.blogContent.servingSuggestions?.bn || "",
                storage_en: recipeData.blogContent.storage?.en || "",
                storage_bn: recipeData.blogContent.storage?.bn || "",
                full_blog_en:
                  recipeData.blogContent.fullBlogText?.en ||
                  recipeData.description?.en ||
                  "",
                full_blog_bn:
                  recipeData.blogContent.fullBlogText?.bn ||
                  recipeData.description?.bn ||
                  "",
              },
            }
          : undefined,
      },
    });

    console.log(`✅ Successfully imported: ${recipe.title_en}`);
    return recipe;
  } catch (error) {
    console.error(`❌ Error importing recipe:`, error);
    throw error;
  }
}

async function importAllRecipes() {
  const recipesDir = path.join(process.cwd(), "lib", "recipes");

  if (!fs.existsSync(recipesDir)) {
    console.log("No recipes directory found");
    return;
  }

  const files = fs.readdirSync(recipesDir).filter((f) => f.endsWith(".json"));

  console.log(`Found ${files.length} recipe(s) to import\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      await importRecipe(path.join(recipesDir, file));
      successCount++;
    } catch (error) {
      errorCount++;
    }
  }

  console.log("\nImport complete!");
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

// Run the import
importAllRecipes()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
