import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to source DB:", process.env.DATABASE_URL?.slice(0, 60) + "...");
  const count = await prisma.recipe.count();
  console.log(`Found ${count} recipes in source DB`);

  const recipes = await prisma.recipe.findMany({
    include: {
      blogContent: true,
      ingredients: { include: { ingredient: true } },
      steps: true,
    },
  });

  const outDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "remote-recipes-backup.json");
  fs.writeFileSync(outPath, JSON.stringify(recipes, null, 2));
  console.log(`Exported ${recipes.length} recipes to ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
