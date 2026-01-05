import prisma from "../lib/prisma";

async function fixBrokenRecipeImages() {
  console.log("🔍 Checking for recipes with broken image URLs...\n");

  const recipes = await prisma.recipe.findMany({
    select: { id: true, title_en: true, image: true },
  });

  const broken = recipes.filter(
    (r) => r.image.includes("[") || r.image.includes("](")
  );

  console.log(`Total recipes: ${recipes.length}`);
  console.log(`Broken images found: ${broken.length}\n`);

  if (broken.length === 0) {
    console.log("✅ No broken images found!");
    return;
  }

  console.log("🔧 Fixing broken images...\n");

  for (const recipe of broken) {
    // Extract the actual URL from markdown format
    // Format: [https://url](https://url) or [https://url](https://google.com/search?q=...)
    let fixedUrl = recipe.image;

    // Extract URL from markdown link format [url](url)
    const markdownMatch = recipe.image.match(/\[(https?:\/\/[^\]]+)\]/);
    if (markdownMatch && markdownMatch[1]) {
      fixedUrl = markdownMatch[1];
    }

    console.log(`Recipe ID ${recipe.id}: ${recipe.title_en}`);
    console.log(`  Before: ${recipe.image}`);
    console.log(`  After:  ${fixedUrl}`);

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { image: fixedUrl },
    });

    console.log(`  ✅ Fixed!\n`);
  }

  console.log("✨ All broken images fixed!");
}

fixBrokenRecipeImages()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
