import prisma from "../lib/prisma.js";
import ingredients from "../lib/ingredients.json" assert { type: "json" };

async function migrateIngredients() {
  console.log("Starting ingredient migration...");
  console.log(`Total ingredients to migrate: ${ingredients.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (const ingredient of ingredients) {
    try {
      await prisma.ingredient.upsert({
        where: { id: parseInt(ingredient.id) },
        update: {
          name_en: ingredient.name_en,
          name_bn: ingredient.name_bn,
          img: ingredient.img,
          phonetic: ingredient.phonetic || [],
        },
        create: {
          id: parseInt(ingredient.id),
          name_en: ingredient.name_en,
          name_bn: ingredient.name_bn,
          img: ingredient.img,
          phonetic: ingredient.phonetic || [],
        },
      });
      successCount++;
      if (successCount % 100 === 0) {
        console.log(`Progress: ${successCount}/${ingredients.length}`);
      }
    } catch (error) {
      errorCount++;
      console.error(
        `Error migrating ingredient ${ingredient.id} (${ingredient.name_en}):`,
        error
      );
    }
  }

  console.log("\nMigration complete!");
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

migrateIngredients()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
