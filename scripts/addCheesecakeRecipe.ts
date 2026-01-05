import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const recipeData = {
  slug: "the-best-new-york-cheesecake",
  title_en: "The Best New York Cheesecake Recipe!",
  title_bn: "সেরা নিউ ইয়র্ক চিজকেক রেসিপি!",
  image: "https://i.ytimg.com/vi/-o1hnXg-4fg/maxresdefault.jpg",
  youtube_url: "https://www.youtube.com/watch?v=-o1hnXg-4fg",
  youtube_id: "-o1hnXg-4fg",
  cuisine: "American",
  category: "Dessert",
  difficulty: "Medium",
  prep_time: 30,
  cook_time: 90,
  servings: 8,
  ingredients: [
    {
      name_en: "Digestive biscuits",
      name_bn: "ডাইজেস্টিভ বিস্কুট",
      quantity: "10",
      unit_en: "pieces",
      unit_bn: "টি",
      notes_en: "Digestive biscuits",
      notes_bn: "ডাইজেস্টিভ বিস্কুট",
    },
    {
      name_en: "Sugar",
      name_bn: "চিনি",
      quantity: "1",
      unit_en: "tbsp",
      unit_bn: "টেবিল চামচ",
      notes_en: "Sugar",
      notes_bn: "চিনি",
    },
    {
      name_en: "Salt",
      name_bn: "লবণ",
      quantity: "1",
      unit_en: "pinch",
      unit_bn: "চিমটি",
      notes_en: "Salt",
      notes_bn: "লবণ",
    },
    {
      name_en: "Butter",
      name_bn: "মাখন",
      quantity: "5",
      unit_en: "tbsp",
      unit_bn: "টেবিল চামচ",
      notes_en: "Melted butter",
      notes_bn: "গলানো মাখন",
    },
    {
      name_en: "Cream Cheese",
      name_bn: "ক্রিম চিজ",
      quantity: "750",
      unit_en: "grams",
      unit_bn: "গ্রাম",
      notes_en: "Cream Cheese",
      notes_bn: "ক্রিম চিজ",
    },
    {
      name_en: "Sugar",
      name_bn: "চিনি",
      quantity: "1",
      unit_en: "cup",
      unit_bn: "কাপ",
      notes_en: "Sugar",
      notes_bn: "চিনি",
    },
    {
      name_en: "Sour cream",
      name_bn: "সাওয়ার ক্রিম",
      quantity: "1/2",
      unit_en: "cup",
      unit_bn: "কাপ",
      notes_en: "Sour cream",
      notes_bn: "সাওয়ার ক্রিম",
    },
    {
      name_en: "Heavy cream",
      name_bn: "হেভি ক্রিম",
      quantity: "1/2",
      unit_en: "cup",
      unit_bn: "কাপ",
      notes_en: "Heavy cream",
      notes_bn: "হেভি ক্রিম",
    },
    {
      name_en: "Lemon juice",
      name_bn: "লেবুর রস",
      quantity: "2",
      unit_en: "tbsp",
      unit_bn: "টেবিল চামচ",
      notes_en: "Fresh lemon juice",
      notes_bn: "তাজা লেবুর রস",
    },
    {
      name_en: "Vanilla essence",
      name_bn: "ভ্যানিলা এসেন্স",
      quantity: "1",
      unit_en: "tbsp",
      unit_bn: "টেবিল চামচ",
      notes_en: "Vanilla essence",
      notes_bn: "ভ্যানিলা এসেন্স",
    },
    {
      name_en: "Salt",
      name_bn: "লবণ",
      quantity: "1/2",
      unit_en: "tsp",
      unit_bn: "চা চামচ",
      notes_en: "Salt",
      notes_bn: "লবণ",
    },
    {
      name_en: "Eggs",
      name_bn: "ডিম",
      quantity: "4",
      unit_en: "pieces",
      unit_bn: "টি",
      notes_en: "Eggs, medium size",
      notes_bn: "ডিম, মাঝারি সাইজের",
    },
    {
      name_en: "Cornstarch",
      name_bn: "কর্নস্টার্চ",
      quantity: "2",
      unit_en: "tbsp",
      unit_bn: "টেবিল চামচ",
      notes_en: "Cornstarch",
      notes_bn: "কর্নস্টার্চ",
    },
  ],
  steps: [
    {
      step_number: 1,
      instruction_en: "Crush 10 digestive biscuits in a food processor.",
      instruction_bn: "ফুড প্রসেসরে ১০টি ডাইজেস্টিভ বিস্কুট গুঁড়ো করে নিন।",
      timestamp: "0:06",
    },
    {
      step_number: 2,
      instruction_en:
        "In a bowl, mix the crushed biscuits with 1 tbsp sugar and a pinch of salt.",
      instruction_bn:
        "একটি বাটিতে বিস্কুটের গুঁড়ো, ১ টেবিল চামচ চিনি এবং এক চিমটি লবণ মিশিয়ে নিন।",
      timestamp: "0:24",
    },
    {
      step_number: 3,
      instruction_en:
        "Add 5 tbsp melted butter and mix well until it looks like wet sand.",
      instruction_bn:
        "৫ টেবিল চামচ গলানো মাখন দিয়ে ভালো করে মিশিয়ে নিন যতক্ষণ না এটি ভেজা বালির মতো দেখায়।",
      timestamp: "0:38",
    },
    {
      step_number: 4,
      instruction_en:
        "Press the mixture into the bottom of an 8-inch springform pan.",
      instruction_bn:
        "মিশ্রণটি একটি ৮ ইঞ্চি স্প্রিংফর্ম প্যানের নিচে ভালো করে চেপে বসিয়ে দিন।",
      timestamp: "0:51",
    },
    {
      step_number: 5,
      instruction_en:
        "Bake in a preheated oven at 180°C (350°F) for 8-9 minutes. Then, let it cool and keep it aside.",
      instruction_bn:
        "১৮০ ডিগ্রি সেলসিয়াস (৩৫০ ডিগ্রি ফারেনহাইট) তাপমাত্রায় প্রি-হিটেড ওভেনে ৮-৯ মিনিট বেক করুন। এরপর এটি ঠান্ডা হতে দিন এবং একপাশে রাখুন।",
      timestamp: "1:10",
    },
    {
      step_number: 6,
      instruction_en:
        "In a large bowl, whisk 750g cream cheese until smooth. Gradually add 1 cup sugar and mix well.",
      instruction_bn:
        "একটি বড় বাটিতে ৭৫০ গ্রাম ক্রিম চিজ নিয়ে মসৃণ হওয়া পর্যন্ত ফেটিয়ে নিন। ধীরে ধীরে ১ কাপ চিনি যোগ করুন এবং ভালো করে মিশিয়ে নিন।",
      timestamp: "1:32",
    },
    {
      step_number: 7,
      instruction_en:
        "Add 1/2 cup sour cream and 1/2 cup heavy cream, and mix again.",
      instruction_bn:
        "১/২ কাপ সাওয়ার ক্রিম এবং ১/২ কাপ হেভি ক্রিম যোগ করুন এবং আবার মেশান।",
      timestamp: "2:17",
    },
    {
      step_number: 8,
      instruction_en:
        "Add 2 tbsp lemon juice, 1 tbsp vanilla essence, and 1/2 tsp salt. Mix until combined.",
      instruction_bn:
        "২ টেবিল চামচ লেবুর রস, ১ টেবিল চামচ ভ্যানিলা এসেন্স এবং ১/২ চা চামচ লবণ যোগ করুন। সব কিছু ভালো করে মিশিয়ে নিন।",
      timestamp: "2:32",
    },
    {
      step_number: 9,
      instruction_en:
        "Add 4 eggs one by one and mix on low speed just until incorporated. Do not overmix.",
      instruction_bn:
        "৪টি ডিম একটি একটি করে যোগ করুন এবং কম গতিতে মেশান যতক্ষণ না মিশে যায়। খুব বেশি মেশাবেন না।",
      timestamp: "2:49",
    },
    {
      step_number: 10,
      instruction_en: "Sift in 2 tbsp cornstarch and mix until smooth.",
      instruction_bn:
        "২ টেবিল চামচ কর্নস্টার্চ চেলে দিয়ে মসৃণ হওয়া পর্যন্ত মিশিয়ে নিন।",
      timestamp: "3:22",
    },
    {
      step_number: 11,
      instruction_en:
        "Butter the sides of the pan and line with parchment paper. Pour the batter into the prepared pan.",
      instruction_bn:
        "প্যানের চারপাশ মাখন দিয়ে ব্রাশ করে পার্চমেন্ট পেপার দিয়ে দিন। এরপর ব্যাটারটি তৈরি করা প্যানে ঢেলে দিন।",
      timestamp: "3:38",
    },
    {
      step_number: 12,
      instruction_en:
        "Wrap the pan with aluminum foil and place it in a baking tray. Pour boiling water into the tray (water bath).",
      instruction_bn:
        "প্যানটি অ্যালুমিনিয়াম ফয়েল দিয়ে মুড়িয়ে নিন এবং একটি বেকিং ট্রেতে রাখুন। ট্রেতে ফুটন্ত পানি ঢালুন (ওয়াটার বাথ)।",
      timestamp: "4:11",
    },
    {
      step_number: 13,
      instruction_en:
        "Bake at 180°C (350°F) for 30 minutes, then reduce heat to 150°C (300°F) and bake for another 45-50 minutes.",
      instruction_bn:
        "১৮০ ডিগ্রি সেলসিয়াসে ৩০ মিনিট বেক করুন, তারপর তাপমাত্রা কমিয়ে ১৫০ ডিগ্রি সেলসিয়াস করে আরও ৪৫-৫০ মিনিট বেক করুন।",
      timestamp: "4:41",
    },
    {
      step_number: 14,
      instruction_en:
        "Leave the cheesecake in the hot oven with the door slightly open for another 60 minutes to prevent cracking.",
      instruction_bn:
        "ওভেন বন্ধ করে দরজা একটু খোলা রেখে আরও ৬০ মিনিট চিজকেকটি ওভেনের ভেতরেই থাকতে দিন যাতে এটি ফেটে না যায়।",
      timestamp: "4:49",
    },
    {
      step_number: 15,
      instruction_en:
        "Let it cool completely to room temperature, then cover and refrigerate overnight before serving.",
      instruction_bn:
        "রুম টেম্পারেচারে পুরোপুরি ঠান্ডা হতে দিন, তারপর ঢেকে সারা রাত ফ্রিজে রাখুন। এরপর পরিবেশন করুন।",
      timestamp: "5:01",
    },
  ],
  blogContent: {
    intro_en:
      "Indulge in the ultimate dessert experience with this rich, creamy, and velvety New York Cheesecake. It's the perfect balance of a crunchy biscuit base and a smooth, tangy filling.",
    intro_bn:
      "এই রিচ, ক্রিমি এবং ভেলভেটি নিউ ইয়র্ক চিজকেকের সাথে ডেজার্টের সেরা অভিজ্ঞতা নিন। মচমচে বিস্কুটের বেস এবং মসৃণ, টক-মিষ্টি ফিলিংয়ের নিখুঁত ভারসাম্য এটি।",
    what_makes_it_special_en:
      "This recipe uses a water bath technique and slow cooling to ensure a crack-free, dense, yet creamy texture that New York-style cheesecakes are famous for.",
    what_makes_it_special_bn:
      "এই রেসিপিতে ওয়াটার বাথ টেকনিক এবং ধীরে ধীরে ঠান্ডা করার পদ্ধতি ব্যবহার করা হয়েছে যা নিউ ইয়র্ক-স্টাইল চিজকেকের ঘন এবং ক্রিমি টেক্সচার নিশ্চিত করে এবং এটি ফেটে যাওয়া রোধ করে।",
    cooking_tips_en:
      "Always use room-temperature ingredients for a smooth batter. Avoid over-whisking once eggs are added to prevent air bubbles and cracks.",
    cooking_tips_bn:
      "মসৃণ ব্যাটারের জন্য সবসময় রুম টেম্পারেচারের উপকরণ ব্যবহার করুন। ডিম যোগ করার পর খুব বেশি ফেটাবেন না যাতে ভেতরে বাতাস ঢুকে চিজকেক ফেটে না যায়।",
    serving_en:
      "Serve chilled as is, or top with a fresh berry compote, chocolate ganache, or a drizzle of caramel sauce.",
    serving_bn:
      "ঠান্ডা ঠান্ডা পরিবেশন করুন। উপরে তাজা বেরি কম্পোট, চকলেট গানাশ বা ক্যারামেল সস দিয়েও পরিবেশন করতে পারেন।",
    storage_en:
      "Keep refrigerated in an airtight container for up to 5 days. You can also freeze individual slices for longer storage.",
    storage_bn:
      "এয়ারটাইট কন্টেইনারে ৫ দিন পর্যন্ত ফ্রিজে রাখতে পারেন। দীর্ঘ সময় সংরক্ষণের জন্য প্রতিটি স্লাইস আলাদাভাবে ফ্রিজারে রাখতে পারেন।",
    full_blog_en:
      "Creating the perfect New York Cheesecake is an art, but with this recipe, it's easily achievable at home. The key lies in the quality of ingredients—high-fat cream cheese and fresh heavy cream make all the difference. The process starts with a classic digestive biscuit crust, pre-baked for extra crunch. The filling is carefully mixed at low speeds to maintain that signature dense texture. Using a water bath (bain-marie) provides the gentle heat needed to bake the cake evenly without burning the edges. Perhaps the most crucial step is the cooling process; letting it sit in the oven with the door ajar allows the temperature to drop slowly, which is the secret to a flawless top. After chilling overnight, you'll be rewarded with a cheesecake that's professional-grade, elegant, and absolutely delicious.",
    full_blog_bn:
      "একটি নিখুঁত নিউ ইয়র্ক চিজকেক তৈরি করা একটি শিল্প, তবে এই রেসিপিটি অনুসরণ করলে আপনি বাড়িতেই এটি সহজে তৈরি করতে পারবেন। এর মূল রহস্য হল উপকরণের গুণগত মান—বেশি ফ্যাটযুক্ত ক্রিম চিজ এবং তাজা হেভি ক্রিম এর স্বাদে ভিন্নতা আনে। এটি শুরু হয় ক্লাসিক ডাইজেস্টিভ বিস্কুটের ক্রাস্ট দিয়ে, যা বাড়তি মচমচে ভাবের জন্য আগে থেকে বেক করে নেওয়া হয়। ফিলিংটি খুব সাবধানে কম গতিতে মেশানো হয় যাতে এর সিগনেচার টেক্সচার বজায় থাকে। ওয়াটার বাথ পদ্ধতি ব্যবহারের ফলে চারপাশ পুড়ে না গিয়ে সমানভাবে বেক হয়। সম্ভবত সবচেয়ে গুরুত্বপূর্ণ ধাপ হল ঠান্ডা করার প্রক্রিয়া; ওভেনের দরজা সামান্য খোলা রেখে ধীরে ধীরে ঠান্ডা হতে দেওয়া একটি নিখুঁত টপ পাওয়ার গোপন রহস্য। সারা রাত ফ্রিজে রাখার পর, আপনি পাবেন পেশাদার মানের এক চমৎকার এবং সুস্বাদু চিজকেক।",
  },
};

async function addRecipe() {
  console.log("🍰 Adding New York Cheesecake recipe...\n");

  try {
    // Resolve all ingredients
    const resolvedIngredients: Array<{
      ingredientId: number;
      meta: any;
    }> = [];

    for (const ing of recipeData.ingredients) {
      // Try to find existing ingredient
      let ingredient = await prisma.ingredient.findFirst({
        where: {
          OR: [
            { name_en: { equals: ing.name_en, mode: "insensitive" } },
            { name_bn: { equals: ing.name_bn } },
          ],
        },
      });

      // If not found, create it
      if (!ingredient) {
        console.log(`  Creating new ingredient: ${ing.name_en}`);
        ingredient = await prisma.ingredient.create({
          data: {
            name_en: ing.name_en,
            name_bn: ing.name_bn,
            img: "",
            phonetic: [],
          },
        });
      } else {
        console.log(`  Found existing ingredient: ${ing.name_en}`);
      }

      resolvedIngredients.push({
        ingredientId: ingredient.id,
        meta: ing,
      });
    }

    console.log(`\n✅ Resolved ${resolvedIngredients.length} ingredients\n`);

    // Create the recipe
    const recipe = await prisma.recipe.create({
      data: {
        slug: recipeData.slug,
        title_en: recipeData.title_en,
        title_bn: recipeData.title_bn,
        image: recipeData.image,
        youtube_url: recipeData.youtube_url,
        youtube_id: recipeData.youtube_id,
        cuisine: recipeData.cuisine,
        category: recipeData.category,
        difficulty: recipeData.difficulty,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        servings: recipeData.servings,
        ingredients: {
          create: resolvedIngredients.map((r) => ({
            ingredient_id: r.ingredientId,
            quantity: r.meta.quantity,
            unit_en: r.meta.unit_en,
            unit_bn: r.meta.unit_bn,
            notes_en: r.meta.notes_en || null,
            notes_bn: r.meta.notes_bn || null,
          })),
        },
        steps: {
          create: recipeData.steps.map((s) => ({
            step_number: s.step_number,
            instruction_en: s.instruction_en,
            instruction_bn: s.instruction_bn,
            timestamp: s.timestamp || null,
          })),
        },
        blogContent: {
          create: {
            intro_en: recipeData.blogContent.intro_en,
            intro_bn: recipeData.blogContent.intro_bn,
            what_makes_it_special_en:
              recipeData.blogContent.what_makes_it_special_en,
            what_makes_it_special_bn:
              recipeData.blogContent.what_makes_it_special_bn,
            cooking_tips_en: recipeData.blogContent.cooking_tips_en,
            cooking_tips_bn: recipeData.blogContent.cooking_tips_bn,
            serving_en: recipeData.blogContent.serving_en,
            serving_bn: recipeData.blogContent.serving_bn,
            storage_en: recipeData.blogContent.storage_en || null,
            storage_bn: recipeData.blogContent.storage_bn || null,
            full_blog_en: recipeData.blogContent.full_blog_en,
            full_blog_bn: recipeData.blogContent.full_blog_bn,
          },
        },
      },
      include: {
        ingredients: true,
        steps: true,
        blogContent: true,
      },
    });

    console.log(`✅ Recipe created successfully!`);
    console.log(`   ID: ${recipe.id}`);
    console.log(`   Slug: ${recipe.slug}`);
    console.log(`   Title: ${recipe.title_en}`);
    console.log(`   Ingredients: ${recipe.ingredients.length}`);
    console.log(`   Steps: ${recipe.steps.length}`);
    console.log(`   Has blog content: ${!!recipe.blogContent}`);
  } catch (error) {
    console.error("❌ Error adding recipe:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addRecipe()
  .then(() => {
    console.log("\n✨ Recipe added successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to add recipe:", error);
    process.exit(1);
  });
