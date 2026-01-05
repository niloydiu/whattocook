const fs = require("fs");
const path = require("path");

/**
 * Intelligent Phonetic Generator for Bangladeshi Ingredients
 * Generates phonetic variations based on English names and Bangla romanization patterns
 */

// Comprehensive Bangla to English phonetic mapping
const banglaPhoneticMap = {
  // Vegetables & Produce
  Potato: ["alu", "aloo", "aalu"],
  Onion: ["piaz", "piyaz", "peaj", "peyaj"],
  Garlic: ["rosun", "roshun", "rasun"],
  Ginger: ["ada", "aadaa", "adha"],
  "Green Chili": ["kacha morich", "kachka morich", "morich"],
  Chili: ["morich", "morish", "marich"],
  Tomato: ["tomato", "tamato", "tometo"],
  Eggplant: ["begun", "bagun", "baegun", "begoon"],
  Jackfruit: ["kathal", "kathaal", "kaathal", "kantal"],
  Cauliflower: ["fulkopi", "phulkopi", "foolkopi"],
  Cabbage: ["badha kopi", "badha-kopi", "bandha kopi"],
  Spinach: ["palak", "paalak", "palok", "shak"],
  Pumpkin: ["kumra", "kumro", "kumraa", "lau"],
  "Bottle Gourd": ["lau", "laau", "lao"],
  "Bitter Gourd": ["korola", "karela", "karolla", "ucche"],
  "Ridge Gourd": ["jhinga", "jheengaa", "jhinge"],
  Cucumber: ["shosha", "shasha", "kheera"],
  Carrot: ["gajor", "gajar", "gajjar"],
  Radish: ["mula", "moola", "mullo"],
  Turnip: ["shalgam", "salgam"],
  Beetroot: ["beet", "beetroot"],
  Okra: ["dharosh", "dherosh", "bhindi", "bhendi"],
  Mushroom: ["mushroom", "chattu", "khumbi"],
  Corn: ["bhutta", "maize", "jagya"],
  "Green Beans": ["seem", "sheem", "bean"],
  Peas: ["motor", "motorshuti", "matar"],

  // Proteins
  Chicken: ["murgi", "murgee", "murghi", "chicken"],
  Beef: ["gorur mangsho", "gorur mangso", "mangsho", "beef"],
  Mutton: ["khashir mangsho", "khasi", "khasir mangso"],
  Lamb: ["bherar mangsho", "lamb"],
  Fish: ["mach", "maach", "maachh", "machh"],
  Hilsa: ["ilish", "ilish maach", "elish"],
  Rui: ["rui", "rohu"],
  Katla: ["katla", "catla"],
  Prawn: ["chingri", "chingree", "golda"],
  Shrimp: ["chingri", "choto chingri"],
  Egg: ["dim", "deem", "anda"],
  Duck: ["hash", "haash", "hansher mangsho"],

  // Spices & Herbs
  Turmeric: ["haldi", "holdi", "holdee", "halud"],
  Cumin: ["jeera", "jira", "zira"],
  Coriander: ["dhoniya", "dhonea", "dhania"],
  Cardamom: ["elach", "elaach", "elaichi"],
  Cinnamon: ["dalchini", "daalchini"],
  Cloves: ["lalbog", "labong", "lobongo"],
  "Bay Leaf": ["tejpata", "tezpata", "tej-pata"],
  "Black Pepper": ["gol morich", "golmorich", "kali mirch"],
  "Chili Powder": ["morich gura", "morich powder", "lal morich"],
  "Garam Masala": ["gorom moshla", "garam mashala"],
  Mustard: ["shorisha", "soricha", "rai"],
  Fenugreek: ["methi", "methee"],
  Fennel: ["mouri", "saunf"],
  Nigella: ["kalonji", "kalo jeera", "kalaunji"],
  "Curry Leaves": ["curry pata", "karipatta"],

  // Grains & Pulses
  Rice: ["chal", "chaal", "bhat"],
  Wheat: ["gom", "gehun"],
  Flour: ["atta", "moida", "maida"],
  Lentils: ["dal", "daal", "dhal"],
  "Red Lentils": ["musur dal", "masoor dal", "masur"],
  "Yellow Lentils": ["mug dal", "moong dal"],
  "Black Lentils": ["kalo dal", "urad dal"],
  Chickpeas: ["chola", "chhola", "boot", "chana"],
  "Bengal Gram": ["boot dal", "chana dal"],

  // Dairy
  Milk: ["dud", "dudh", "doodh"],
  Yogurt: ["doi", "dohi", "dahi"],
  Butter: ["makhon", "makhan"],
  Ghee: ["ghee", "ghi"],
  Cheese: ["ponir", "paneer", "paner", "chiz"],
  Cream: ["cream", "malai"],

  // Common Items
  Oil: ["tel", "tail"],
  "Mustard Oil": ["shorisher tel", "sorisher tel", "sarson tel"],
  Salt: ["noon", "nun", "lon", "namak"],
  Sugar: ["chini", "cheeni", "chinee"],
  Jaggery: ["gur", "guur", "gud"],
  Vinegar: ["sirka", "siraka"],
  Tamarind: ["tetul", "tentul", "imli"],
  Coconut: ["narikel", "narial", "narkol"],

  // Fruits
  Mango: ["aam", "am", "aaam"],
  Banana: ["kola", "kela", "kolaa"],
  Papaya: ["pepe", "papaya", "papita"],
  Guava: ["peyara", "amrood", "payara"],
  Lemon: ["lebu", "leboo", "nimbu"],
  Orange: ["komla", "komola", "kamla lebu"],
  Apple: ["aapel", "apple", "seb"],
  Watermelon: ["tormuj", "tarbuj", "tarbooz"],
  Lychee: ["lichu", "litchi", "lichi"],
  Pineapple: ["anaros", "anarosh", "pineapple"],

  // Nuts & Seeds
  Cashew: ["kaju", "kaaju", "kaju badam"],
  Almond: ["badam", "badaam"],
  Peanut: ["cheenabadam", "china badam", "moongphali"],
  Walnut: ["akhroth", "akhrot"],
  Sesame: ["til", "teel"],

  // Breads
  Bread: ["ruti", "roti", "ruti"],
  Paratha: ["porota", "parota", "paratha"],
  Naan: ["nan", "naan"],
  Chapati: ["chapati", "fulka"],
};

/**
 * Generate phonetic variations based on English name
 */
function generatePhoneticVariations(englishName, banglaName) {
  const variations = [];

  // Check if we have a predefined mapping
  if (banglaPhoneticMap[englishName]) {
    return banglaPhoneticMap[englishName];
  }

  // Generate variations from English name
  const base = englishName.toLowerCase().trim();
  variations.push(base);

  // Add common spelling variations
  const vowelVariations = [
    [base, base.replace(/a/g, "aa")],
    [base, base.replace(/o/g, "oo")],
    [base, base.replace(/e/g, "ee")],
    [base, base.replace(/i/g, "ee")],
    [base, base.replace(/u/g, "oo")],
  ].flat();

  variations.push(...new Set(vowelVariations));

  // Remove duplicates and return up to 4 variations
  const unique = [...new Set(variations.filter((v) => v && v.length > 2))];
  return unique.slice(0, 4);
}

/**
 * Process ingredients and add phonetic variations
 */
function addPhoneticToIngredients() {
  const filePath = path.join(__dirname, "..", "lib", "ingredients.json");

  console.log("📖 Reading ingredients.json...");
  const data = fs.readFileSync(filePath, "utf8");
  const ingredients = JSON.parse(data);

  console.log(`✅ Found ${ingredients.length} ingredients`);
  console.log("🔄 Adding phonetic variations...\n");

  let processedCount = 0;
  const updatedIngredients = ingredients.map((ingredient, index) => {
    // Skip if already has phonetic
    if (ingredient.phonetic && ingredient.phonetic.length > 0) {
      return ingredient;
    }

    // Generate phonetic variations
    const phonetic = generatePhoneticVariations(
      ingredient.name_en,
      ingredient.name_bn
    );

    processedCount++;

    // Log progress every 100 items
    if (processedCount % 100 === 0) {
      console.log(`   Processed ${processedCount}/${ingredients.length}...`);
    }

    return {
      ...ingredient,
      phonetic,
    };
  });

  console.log(
    `\n✅ Added phonetic variations to ${processedCount} ingredients`
  );
  console.log("💾 Writing updated data...");

  // Write back to file
  fs.writeFileSync(
    filePath,
    JSON.stringify(updatedIngredients, null, 2),
    "utf8"
  );

  console.log("✨ Done! ingredients.json updated successfully");

  // Show some examples
  console.log("\n📝 Example entries:");
  updatedIngredients.slice(0, 5).forEach((ing) => {
    console.log(
      `   ${ing.name_en} (${ing.name_bn}): [${ing.phonetic.join(", ")}]`
    );
  });
}

// Run the script
try {
  addPhoneticToIngredients();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
