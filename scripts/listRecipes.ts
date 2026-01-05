import prisma from "../lib/prisma";

async function listRecipes() {
  const recipes = await prisma.recipe.findMany({
    select: { id: true, slug: true, title_en: true },
    orderBy: { id: "asc" },
  });
  
  console.log("📚 Existing recipes in database:\n");
  recipes.forEach((r) => {
    console.log(`  ${r.id}. ${r.slug}`);
    console.log(`     "${r.title_en}"\n`);
  });
  
  console.log(`Total: ${recipes.length} recipes`);
  
  await prisma.$disconnect();
}

listRecipes();
