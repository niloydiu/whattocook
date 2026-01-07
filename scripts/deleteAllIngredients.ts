import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🧹 Deleting all ingredients and related wishlist/allergy links..."
  );
  try {
    const ingCount = await prisma.ingredient.count();
    console.log("Ingredients before:", ingCount);

    try {
      await prisma.wishlistIngredient.deleteMany({});
      console.log("Cleared wishlistIngredient links.");
    } catch (e: any) {
      console.warn(
        "wishlistIngredient table missing or error clearing it, continuing.",
        (e && e.message) || e
      );
    }

    try {
      await prisma.userAllergy.deleteMany({});
      console.log("Cleared userAllergy links.");
    } catch (e: any) {
      console.warn(
        "userAllergy table missing or error clearing it, continuing.",
        (e && e.message) || e
      );
    }

    const res = await prisma.ingredient.deleteMany({});
    console.log(`Deleted ${res.count} ingredients.`);

    // Reset serial sequence for Ingredient.id
    try {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"Ingredient"','id'), COALESCE((SELECT MAX(id) FROM "Ingredient"), 0));`
      );
      console.log("Reset Ingredient id sequence.");
    } catch (e: any) {
      console.warn("Could not reset Ingredient sequence:", (e && e.message) || e);
    }
  } catch (e: any) {
    console.error("Error deleting ingredients:", (e && e.message) || e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
