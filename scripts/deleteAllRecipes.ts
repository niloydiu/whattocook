import prisma from "../lib/prisma";

async function main() {
  console.log("🗑️  Starting to delete all recipe data...");
  console.log("Connecting using DATABASE_URL:",
    process.env.DATABASE_URL ? process.env.DATABASE_URL.slice(0, 60) + "..." : "(none)");

  try {
    const recipeCount = await prisma.recipe.count();
    const ingredientLinkCount = await prisma.recipeIngredient.count();
    const stepCount = await prisma.recipeStep.count();
    const blogContentCount = await prisma.recipeBlogContent.count();

    console.log("📊 Current database state:");
    console.log(`   - Recipes: ${recipeCount}`);
    console.log(`   - Recipe-Ingredient links: ${ingredientLinkCount}`);
    console.log(`   - Recipe steps: ${stepCount}`);
    console.log(`   - Blog content entries: ${blogContentCount}\n`);

    if (recipeCount === 0) {
      console.log("✨ No recipes found. Database is already clean.");
      return;
    }

    console.log("🔄 Deleting all recipes and related data...");
    const result = await prisma.recipe.deleteMany({});

    console.log(`\n✅ Successfully deleted ${result.count} recipes!`);

    const remainingRecipes = await prisma.recipe.count();
    const remainingIngredientLinks = await prisma.recipeIngredient.count();
    const remainingSteps = await prisma.recipeStep.count();
    const remainingBlogContent = await prisma.recipeBlogContent.count();

    console.log("📊 Database state after deletion:");
    console.log(`   - Recipes: ${remainingRecipes}`);
    console.log(`   - Recipe-Ingredient links: ${remainingIngredientLinks}`);
    console.log(`   - Recipe steps: ${remainingSteps}`);
    console.log(`   - Blog content entries: ${remainingBlogContent}\n`);

    if (remainingRecipes === 0 && remainingIngredientLinks === 0 && remainingSteps === 0 && remainingBlogContent === 0) {
      console.log("🎉 All recipe data has been successfully deleted!");
    } else {
      console.warn("⚠️  Warning: Some data might still remain. Please check manually.");
    }
  } catch (error) {
    console.error("❌ Error deleting recipes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("\n✨ Script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });
