import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAndFixSequence() {
  try {
    // Get the max ingredient ID
    const maxIngredient = await prisma.ingredient.findFirst({
      orderBy: { id: "desc" },
    });

    console.log("Checking ingredient sequence...");
    
    if (maxIngredient) {
      console.log(`Max ingredient ID: ${maxIngredient.id}`);
      
      // Fix the sequence in PostgreSQL
      await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"Ingredient"', 'id'), COALESCE((SELECT MAX(id) FROM "Ingredient"), 1), true);
      `);
      
      console.log("✅ Sequence fixed!");
    } else {
      console.log("No ingredients found.");
    }

    const count = await prisma.ingredient.count();
    console.log(`Total ingredients: ${count}`);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixSequence()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
