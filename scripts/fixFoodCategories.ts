import prisma from "../lib/prisma";

const CATEGORY_MAP = [
  { category: "Dessert", keywords: ["malpua", "pitha", "cake", "mousse", "sweet", "halwa", "dessert", "payesh", "sandesh", "laddu", "kheer", "pudding", "cheesecake", "brownie"] },
  { category: "Drinks", keywords: ["coffee", "tea", "juice", "drink", "smoothie", "lassi", "sherbet", "cappuccino", "latte", "shake", "cooler", "mocktail"] },
  { category: "Soup", keywords: ["soup", "stew", "shorba"] },
  { category: "Salad", keywords: ["salad"] },
  { category: "Appetizer", keywords: ["pakora", "pakoda", "fritter", "vorta", "bhorta", "fry", "manchurian", "crunchy", "crispy", "snack", "nuggets", "finger", "bite", "piyaju", "chop"] },
  { category: "Spicy", keywords: ["chilli", "spicy", "peri", "schezuan", "naga", "pepper", "masala fry"] },
  { category: "Sour", keywords: ["sour", "lemon", "tamarind", "achar", "pickle"] }
];

async function main() {
  console.log("Starting food category update...");
  const recipes = await prisma.recipe.findMany({
    select: { id: true, title_en: true, foodCategory: true }
  });

  console.log(`Found ${recipes.length} recipes.`);

  let updatedCount = 0;

  for (const recipe of recipes) {
    const title = recipe.title_en.toLowerCase();
    let detectedCategory = "Savory"; // Default

    for (const mapping of CATEGORY_MAP) {
      if (mapping.keywords.some(k => {
        const regex = new RegExp(`\\b${k}\\b`, "i");
        return regex.test(title);
      })) {
        detectedCategory = mapping.category;
        break;
      }
    }

    // Special cases or manual overrides if needed
    if (title.includes("coffee") || title.includes("cappuccino")) detectedCategory = "Drinks";
    if (title.includes("pakora") || title.includes("pakoda")) detectedCategory = "Appetizer";

    if (recipe.foodCategory !== detectedCategory) {
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { foodCategory: detectedCategory }
      });
      console.log(`Updated "${recipe.title_en}" -> ${detectedCategory}`);
      updatedCount++;
    }
  }

  console.log(`Finished! Updated ${updatedCount} recipes.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
