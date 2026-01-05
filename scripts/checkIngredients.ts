import prisma from "../lib/prisma";

async function checkIngredients() {
  try {
    console.log("🔍 Fetching all ingredients...\n");
    
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { id: "asc" },
    });

    console.log(`Total ingredients: ${ingredients.length}\n`);

    // Check for duplicates by name_en
    console.log("=== Checking for duplicates by name_en ===");
    const nameEnMap = new Map<string, any[]>();
    
    ingredients.forEach((ing) => {
      const key = ing.name_en.toLowerCase().trim();
      if (!nameEnMap.has(key)) {
        nameEnMap.set(key, []);
      }
      nameEnMap.get(key)!.push(ing);
    });

    const duplicatesEn = Array.from(nameEnMap.entries())
      .filter(([_, items]) => items.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    if (duplicatesEn.length > 0) {
      console.log(`\n❌ Found ${duplicatesEn.length} duplicate groups by name_en:\n`);
      duplicatesEn.forEach(([name, items]) => {
        console.log(`  "${name}" (${items.length} duplicates):`);
        items.forEach((item) => {
          console.log(`    ID: ${item.id}, EN: "${item.name_en}", BN: "${item.name_bn}", IMG: ${item.img ? "✓" : "✗"}`);
        });
        console.log("");
      });
    } else {
      console.log("✅ No duplicates found by name_en\n");
    }

    // Check for duplicates by name_bn
    console.log("=== Checking for duplicates by name_bn ===");
    const nameBnMap = new Map<string, any[]>();
    
    ingredients.forEach((ing) => {
      const key = ing.name_bn.trim();
      if (!nameBnMap.has(key)) {
        nameBnMap.set(key, []);
      }
      nameBnMap.get(key)!.push(ing);
    });

    const duplicatesBn = Array.from(nameBnMap.entries())
      .filter(([_, items]) => items.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    if (duplicatesBn.length > 0) {
      console.log(`\n❌ Found ${duplicatesBn.length} duplicate groups by name_bn:\n`);
      duplicatesBn.forEach(([name, items]) => {
        console.log(`  "${name}" (${items.length} duplicates):`);
        items.forEach((item) => {
          console.log(`    ID: ${item.id}, EN: "${item.name_en}", BN: "${item.name_bn}", IMG: ${item.img ? "✓" : "✗"}`);
        });
        console.log("");
      });
    } else {
      console.log("✅ No duplicates found by name_bn\n");
    }

    // Check for broken/empty images
    console.log("=== Checking for broken/empty images ===\n");
    const brokenImages = ingredients.filter((ing) => {
      return !ing.img || ing.img.trim() === "" || ing.img === "Unknown";
    });

    if (brokenImages.length > 0) {
      console.log(`❌ Found ${brokenImages.length} ingredients with broken/empty images:\n`);
      brokenImages.forEach((ing) => {
        console.log(`  ID: ${ing.id}, EN: "${ing.name_en}", BN: "${ing.name_bn}", IMG: "${ing.img}"`);
      });
    } else {
      console.log("✅ All ingredients have valid images\n");
    }

    // Summary
    console.log("\n=== SUMMARY ===");
    console.log(`Total ingredients: ${ingredients.length}`);
    console.log(`Duplicate groups (name_en): ${duplicatesEn.length}`);
    console.log(`Duplicate groups (name_bn): ${duplicatesBn.length}`);
    console.log(`Broken/empty images: ${brokenImages.length}`);

    // Export duplicates and broken images for fixing
    if (duplicatesEn.length > 0 || brokenImages.length > 0) {
      console.log("\n=== Export data for fixing ===");
      
      const exportData = {
        duplicates: duplicatesEn.map(([name, items]) => ({
          name_en: name,
          count: items.length,
          items: items.map(i => ({
            id: i.id,
            name_en: i.name_en,
            name_bn: i.name_bn,
            img: i.img,
          })),
        })),
        brokenImages: brokenImages.map(i => ({
          id: i.id,
          name_en: i.name_en,
          name_bn: i.name_bn,
          img: i.img,
        })),
      };

      return exportData;
    }

    return null;
  } catch (error) {
    console.error("Error checking ingredients:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkIngredients().then((data) => {
  if (data) {
    console.log("\n📊 Export data available in return value");
  }
});
