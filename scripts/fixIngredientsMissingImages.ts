import prisma from "../lib/prisma";
import fetch from "node-fetch";

const TIMEOUT_MS = 5000;

interface MealDbIngredient {
  idIngredient: string;
  strIngredient: string;
  strThumb: string;
}

async function getMealDbIngredients(): Promise<Map<string, string>> {
  try {
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list");
    const data = (await res.json()) as { meals: MealDbIngredient[] };
    const map = new Map<string, string>();
    if (data.meals) {
      data.meals.forEach((m) => {
        map.set(m.strIngredient.toLowerCase(), `https://www.themealdb.com/images/ingredients/${encodeURIComponent(m.strIngredient)}.png`);
      });
    }
    return map;
  } catch (e) {
    console.error("Failed to fetch MealDB ingredients", e);
    return new Map();
  }
}

async function getWikipediaImage(title: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title
    )}&prop=pageimages&format=json&pithumbsize=500&redirects=1`;
    const res = await fetch(url);
    const data: any = await res.json();
    const pages = data?.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pageId !== "-1" && pages[pageId].thumbnail) {
        return pages[pageId].thumbnail.source;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function checkUrl(url: string): Promise<boolean> {
  if (!url) return false;
  if (url.startsWith("/")) return false; // Force update for local paths

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Some sites block HEAD, so we might need GET with 0 bytes range
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal as any,
    });

    clearTimeout(timeout);
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function fixIngredientsImages() {
  console.log("🚀 Starting Ingredient Image Fixer (v3)...");

  const mealDbMap = await getMealDbIngredients();
  console.log(`Loaded ${mealDbMap.size} ingredients from TheMealDB.`);

  const ingredients = await prisma.ingredient.findMany();
  console.log(`Found ${ingredients.length} ingredients in our database to check.`);

  let fixedFromMealDb = 0;
  let fixedFromWiki = 0;
  let alreadyOkCount = 0;
  let failedCount = 0;

  for (const ingredient of ingredients) {
    const isLocalPath = ingredient.img?.startsWith("/");
    const isEmpty = !ingredient.img;
    let needsFix = isEmpty || isLocalPath;

    // Only check URL if it's not empty and not local
    if (!needsFix && ingredient.img) {
      const ok = await checkUrl(ingredient.img);
      if (!ok) needsFix = true;
    }

    if (!needsFix) {
      alreadyOkCount++;
      if (alreadyOkCount % 100 === 0) {
        console.log(`✓ ${alreadyOkCount} ingredients verified...`);
      }
      continue;
    }

    console.log(`🔍 Attempting to find image for: ${ingredient.name_en}...`);

    const candidates = [
      ingredient.name_en, // Exact
      ingredient.name_en.replace(/\s*\(.*\)/, ""), // Remove brackets: "Onion (White)" -> "Onion"
      ingredient.name_en.split(" ").pop() || "", // Last word: "Green Apple" -> "Apple"
      ingredient.name_en.split(" ")[0] || "", // First word: "Kidney Beans" -> "Kidney"
    ].filter((c) => c && c.length > 2);

    // Filter unique candidates
    const uniqueCandidates = Array.from(new Set(candidates));

    let found = false;
    for (const name of uniqueCandidates) {
      // 1. Try MealDB
      const mealDbImg = mealDbMap.get(name.toLowerCase());
      if (mealDbImg) {
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: { img: mealDbImg },
        });
        console.log(`  ✅ Fixed from MealDB [${name}]: ${ingredient.name_en}`);
        fixedFromMealDb++;
        found = true;
        break;
      }

      // 2. Try Wikipedia
      const wikiImg = await getWikipediaImage(name);
      if (wikiImg) {
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: { img: wikiImg },
        });
        console.log(`  ✅ Fixed from Wikipedia [${name}]: ${ingredient.name_en}`);
        fixedFromWiki++;
        found = true;
        break;
      }

      // 3. Try Wikipedia (food)
      const wikiImgFood = await getWikipediaImage(`${name} (food)`);
      if (wikiImgFood) {
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: { img: wikiImgFood },
        });
        console.log(`  ✅ Fixed from Wikipedia (food keyword) [${name}]: ${ingredient.name_en}`);
        fixedFromWiki++;
        found = true;
        break;
      }
    }

    if (!found) {
      console.log(`  ❌ No donor found for: ${ingredient.name_en}`);
      failedCount++;
    }
  }

  console.log("\nSummary:");
  console.log(`✅ Fixed from MealDB: ${fixedFromMealDb}`);
  console.log(`✅ Fixed from Wikipedia: ${fixedFromWiki}`);
  console.log(`⭐ Already OK: ${alreadyOkCount}`);
  console.log(`❌ Failed: ${failedCount}`);
}

fixIngredientsImages()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
