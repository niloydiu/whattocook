import prisma from "../lib/prisma";

async function deleteRecipe(slug: string) {
  console.log(`🗑️  Deleting recipe with slug: ${slug}...`);
  
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      select: { id: true, title_en: true },
    });
    
    if (!recipe) {
      console.log(`❌ Recipe with slug "${slug}" not found!`);
      return;
    }
    
    console.log(`Found: ${recipe.title_en} (ID: ${recipe.id})`);
    
    // Delete the recipe (cascade will handle ingredients, steps, blogContent)
    await prisma.recipe.delete({
      where: { slug },
    });
    
    console.log(`✅ Successfully deleted recipe "${slug}"`);
  } catch (error) {
    console.error("Error deleting recipe:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage: npx tsx scripts/deleteRecipe.ts <slug>
const slug = process.argv[2];

if (!slug) {
  console.log("Usage: npx tsx scripts/deleteRecipe.ts <slug>");
  console.log("Example: npx tsx scripts/deleteRecipe.ts hyderabadi-chicken-masala");
  process.exit(1);
}

deleteRecipe(slug);
