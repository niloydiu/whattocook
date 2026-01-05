import prisma from "../lib/prisma";

// TheMealDB ingredient images mapping
const ingredientImageMap: { [key: string]: string } = {
  "egg": "https://www.themealdb.com/images/ingredients/Egg-Small.png",
  "potato": "https://www.themealdb.com/images/ingredients/Potatoes-Small.png",
  "cauliflower": "https://www.themealdb.com/images/ingredients/Cauliflower-Small.png",
  "tomato": "https://www.themealdb.com/images/ingredients/Tomato-Small.png",
  "ginger": "https://www.themealdb.com/images/ingredients/Ginger-Small.png",
  "garlic": "https://www.themealdb.com/images/ingredients/Garlic-Small.png",
  "dry red chili": "https://www.themealdb.com/images/ingredients/Red%20Chili-Small.png",
  "red chili": "https://www.themealdb.com/images/ingredients/Red%20Chili-Small.png",
  "cumin seeds": "https://www.themealdb.com/images/ingredients/Cumin-Small.png",
  "cumin": "https://www.themealdb.com/images/ingredients/Cumin-Small.png",
  "coriander seeds": "https://www.themealdb.com/images/ingredients/Coriander-Small.png",
  "coriander": "https://www.themealdb.com/images/ingredients/Coriander-Small.png",
  "mustard oil": "https://www.themealdb.com/images/ingredients/Vegetable%20Oil-Small.png",
  "oil": "https://www.themealdb.com/images/ingredients/Vegetable%20Oil-Small.png",
  "vegetable oil": "https://www.themealdb.com/images/ingredients/Vegetable%20Oil-Small.png",
};

async function fixBrokenImages() {
  try {
    console.log("🔧 Fixing broken ingredient images...\n");

    // Get all ingredients with broken images
    const brokenIngredients = await prisma.ingredient.findMany({
      where: {
        img: {
          in: ["", "Unknown"],
        },
      },
    });

    console.log(`Found ${brokenIngredients.length} ingredients with broken images\n`);

    const fixed: any[] = [];
    const needsManualFix: any[] = [];

    for (const ingredient of brokenIngredients) {
      const key = ingredient.name_en.toLowerCase().trim();
      
      if (ingredientImageMap[key]) {
        // Update the ingredient with the correct image
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: { img: ingredientImageMap[key] },
        });

        console.log(`✅ Fixed: ${ingredient.name_en} (ID: ${ingredient.id})`);
        console.log(`   Image: ${ingredientImageMap[key]}\n`);
        
        fixed.push({
          id: ingredient.id,
          name_en: ingredient.name_en,
          name_bn: ingredient.name_bn,
          newImage: ingredientImageMap[key],
        });
      } else {
        console.log(`⚠️  Needs manual fix: ${ingredient.name_en} (ID: ${ingredient.id})`);
        needsManualFix.push({
          id: ingredient.id,
          name_en: ingredient.name_en,
          name_bn: ingredient.name_bn,
          currentImage: ingredient.img,
        });
      }
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Total broken: ${brokenIngredients.length}`);
    console.log(`Fixed: ${fixed.length}`);
    console.log(`Needs manual fix: ${needsManualFix.length}`);

    if (needsManualFix.length > 0) {
      console.log("\n=== Ingredients needing manual fix ===");
      console.log(JSON.stringify(needsManualFix, null, 2));
    }

    return { fixed, needsManualFix };
  } catch (error) {
    console.error("Error fixing images:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixBrokenImages().then((result) => {
  console.log("\n✨ Done!");
  process.exit(0);
});
