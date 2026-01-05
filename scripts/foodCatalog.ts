export type FoodEntry = {
  englishName: string;
  banglaName: string;
  phoneticNames: string[];
  imageLink: string;
  category: string;
  region: string;
};

export const foodCatalog: FoodEntry[] = [
  {
    englishName: "Basmati Rice",
    banglaName: "বাসমতি চাল",
    phoneticNames: ["Bas-mah-tee Chaal", "Bas-mah-tee Chuh-wul"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/41/Basmati_rice_variety.jpg",
    category: "Grains & Rice (Staples)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Kataribhog Rice",
    banglaName: "কাতারিভোগ চাল",
    phoneticNames: ["Kuh-tah-ree-bhog"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/Kataribhog_Rice.jpg",
    category: "Grains & Rice (Staples)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Chinigura Rice",
    banglaName: "চিনিগুড়া চাল",
    phoneticNames: ["Chee-nee-goo-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Kalijira_Rice.jpg/640px-Kalijira_Rice.jpg",
    category: "Grains & Rice (Staples)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Puffed Rice",
    banglaName: "মুড়ি",
    phoneticNames: ["Moo-ree", "Moor-moo-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a5/Puffed_rice_01.JPG",
    category: "Grains & Rice (Staples)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Flattened Rice",
    banglaName: "চিঁড়া",
    phoneticNames: ["Chee-rah", "Po-hah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/8e/Poha_%28Flattened_Rice%29.jpg",
    category: "Grains & Rice (Staples)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Red Lentils",
    banglaName: "মসুর ডাল",
    phoneticNames: ["Muh-soor Daal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Red_Lentils_Split.jpg",
    category: "Lentils & Pulses (Dals)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Split Mung Bean",
    banglaName: "মুগ ডাল",
    phoneticNames: ["Moong Daal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mung_beans_split.jpg",
    category: "Lentils & Pulses (Dals)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pigeon Peas",
    banglaName: "তুর ডাল",
    phoneticNames: ["Ur-hur Daal", "Toor Daal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/ee/Toor_dal.jpg",
    category: "Lentils & Pulses (Dals)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Turmeric",
    banglaName: "হলুদ",
    phoneticNames: ["Ho-lood", "Hul-dee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/5b/Turmeric_curcuma_longa.jpg",
    category: "Essential Spices",
    region: "Bangladesh and India",
  },
  {
    englishName: "Nigella Seeds",
    banglaName: "কালো জিরা",
    phoneticNames: ["Kah-lo Jee-rah", "Kuh-lon-jee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/86/Nigella_seeds.jpg",
    category: "Essential Spices",
    region: "Bangladesh and India",
  },
  {
    englishName: "Wild Celery Seeds",
    banglaName: "রধুনি",
    phoneticNames: ["Rah-dhoo-nee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Radhuni.jpg",
    category: "Essential Spices",
    region: "Bangladesh and India",
  },
  {
    englishName: "Hilsa",
    banglaName: "ইলিশ",
    phoneticNames: ["Ee-leesh"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/Tenualosa_ilisha_02.JPG",
    category: "Fish",
    region: "Bangladesh and India",
  },
  {
    englishName: "Rohu Carp",
    banglaName: "রুই",
    phoneticNames: ["Roo-ee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Labeo_rohita_2.jpg",
    category: "Fish",
    region: "Bangladesh and India",
  },
  {
    englishName: "Giant River Prawn",
    banglaName: "গলদা চিংড়ি",
    phoneticNames: ["Gol-dah Ching-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Macrobrachium_rosenbergii.jpg",
    category: "Fish",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pointed Gourd",
    banglaName: "পতল",
    phoneticNames: ["Po-tol", "Pur-wul"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/11/Pointed_gourd.jpg",
    category: "Native Vegetables & Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "Red Amaranth",
    banglaName: "লাল শাক",
    phoneticNames: ["Laal Shaak"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/3c/Amaranth_leaves.jpg",
    category: "Native Vegetables & Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "Water Spinach",
    banglaName: "কলমি শাক",
    phoneticNames: ["Kol-mee Shaak"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/7d/Ipomoea_aquatica_leaves.jpg",
    category: "Native Vegetables & Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "Jackfruit",
    banglaName: "কাঠাল",
    phoneticNames: ["Kaa-thaal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Jackfruit_hanging.JPG",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Hog Plum",
    banglaName: "আমরা",
    phoneticNames: ["Aam-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Spondias_mombin_fruits.JPG",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Wood Apple",
    banglaName: "বেল",
    phoneticNames: ["Bael"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/5e/Aegle_marmelos_fruit.JPG",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Elephant Apple",
    banglaName: "চালতা",
    phoneticNames: ["Chaal-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a3/Dillenia_indica_fruit_2.jpg",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Indian Gooseberry",
    banglaName: "আমলা",
    phoneticNames: ["Aam-lo-kee", "Aam-laa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/da/Amla_fruit.jpg",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Jujube",
    banglaName: "বোড়ই",
    phoneticNames: ["Bo-roy", "Baer"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e3/Ziziphus_mauritiana_fruits.jpg",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Blackberry",
    banglaName: "কালো জাম",
    phoneticNames: ["Kaa-lo Jaam", "Jaa-moon"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Syzygium_cumini_fruits.JPG",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Star Fruit",
    banglaName: "কমরাঙ্গা",
    phoneticNames: ["Kaam-raang-gaa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/9/91/Star_fruit_on_tree.jpg",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Custard Apple",
    banglaName: "সীতাফল",
    phoneticNames: ["Aa-tah", "See-tah-ful"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Sugar_apple.JPG",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pomelo",
    banglaName: "বাতাবি লেবু",
    phoneticNames: ["Bah-tah-bee Lay-boo"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/f/f3/Pomelo_fruit.jpg",
    category: "Seasonal Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Goat Meat",
    banglaName: "খাসির মাংস",
    phoneticNames: ["Khaa-sheer Maang-sho"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/77/Goat_meat_cut.JPG",
    category: "Meat, Poultry & Game",
    region: "Bangladesh and India",
  },
  {
    englishName: "Beef",
    banglaName: "গরুর মাংস",
    phoneticNames: ["Go-roor Maang-sho"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a4/Fresh_Beef.jpg",
    category: "Meat, Poultry & Game",
    region: "Bangladesh and India",
  },
  {
    englishName: "Chicken",
    banglaName: "মুরগির মাংস",
    phoneticNames: ["Moor-geer Maang-sho"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/df/Raw_chicken_meat.JPG",
    category: "Meat, Poultry & Game",
    region: "Bangladesh and India",
  },
  {
    englishName: "Duck Meat",
    banglaName: "হাঁসের মাংস",
    phoneticNames: ["Haa-shayr Maang-sho"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/23/Duck_meat_raw.jpg",
    category: "Meat, Poultry & Game",
    region: "Bangladesh and India",
  },
  {
    englishName: "Quail Meat",
    banglaName: "কোয়েল পাখি",
    phoneticNames: ["Ko-el Paa-kee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/b5/Quail_meat.JPG",
    category: "Meat, Poultry & Game",
    region: "Bangladesh and India",
  },
  {
    englishName: "Clarified Butter",
    banglaName: "ঘি",
    phoneticNames: ["Ghee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Ghee_bowl.jpg",
    category: "Dairy & Fats",
    region: "Bangladesh and India",
  },
  {
    englishName: "Mustard Oil",
    banglaName: "সরিষার তেল",
    phoneticNames: ["Shor-shayr Tail"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/Mustard_oil_in_glass.jpg",
    category: "Dairy & Fats",
    region: "Bangladesh and India",
  },
  {
    englishName: "Cottage Cheese",
    banglaName: "ছানা",
    phoneticNames: ["Chhaa-naa", "Pah-neer"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Paneer_cubes.jpg",
    category: "Dairy & Fats",
    region: "Bangladesh and India",
  },
  {
    englishName: "Yogurt",
    banglaName: "দই",
    phoneticNames: ["Doy", "Duh-hee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/af/Curd_in_pot.jpg",
    category: "Dairy & Fats",
    region: "Bangladesh and India",
  },
  {
    englishName: "Milk Solids",
    banglaName: "খোয়া",
    phoneticNames: ["Khoy-aa", "Maa-waa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Khoya.JPG",
    category: "Dairy & Fats",
    region: "Bangladesh and India",
  },
  {
    englishName: "Hollow Fried Balls",
    banglaName: "ফুচকা শেল",
    phoneticNames: ["Fooch-kaa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Golgappe.JPG/640px-Golgappe.JPG",
    category: "Street Food Specifics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Black Salt",
    banglaName: "কালো লবণ",
    phoneticNames: ["Beet Lo-bon"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Kala_Namak_Salt.jpg",
    category: "Street Food Specifics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Tamarind",
    banglaName: "টকটকে",
    phoneticNames: ["Tay-tool", "Eem-lee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/82/Tamarind_fruit.jpg",
    category: "Street Food Specifics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Bok Choy",
    banglaName: "বোক চয়",
    phoneticNames: ["Bok Choy"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d5/Bok_Choy.jpg",
    category: "Chinese Ingredients",
    region: "China",
  },
  {
    englishName: "Sichuan Pepper",
    banglaName: "সিচুয়ান মরিচ",
    phoneticNames: ["Sich-wahn Peh-per"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Sichuan_pepper.jpg",
    category: "Chinese Ingredients",
    region: "China",
  },
  {
    englishName: "Star Anise",
    banglaName: "স্টার অ্যানিস",
    phoneticNames: ["Star An-is"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Star_anise.jpg",
    category: "Chinese Ingredients",
    region: "China",
  },
  {
    englishName: "Ginger",
    banglaName: "আদা",
    phoneticNames: ["Ah-daa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/37/Zingiber_officinale_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-227.jpg",
    category: "Global Staples",
    region: "Global",
  },
  {
    englishName: "Garlic",
    banglaName: "রসুন",
    phoneticNames: ["Ro-sun"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d5/Garlics.jpg",
    category: "Global Staples",
    region: "Global",
  },
  {
    englishName: "Blueberry",
    banglaName: "ব্লুবেরি",
    phoneticNames: ["Blue-berry"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/12/Blueberries.jpg",
    category: "American Ingredients",
    region: "America",
  },
  {
    englishName: "Cranberry",
    banglaName: "ক্র্যানবেরি",
    phoneticNames: ["Cran-berry"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d0/Cranberries.jpg",
    category: "American Ingredients",
    region: "America",
  },
  {
    englishName: "Avocado",
    banglaName: "অ্যাভোকাডো",
    phoneticNames: ["Av-oh-cah-doh"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/0c/Avocado_with_cross_section.jpg",
    category: "American Ingredients",
    region: "America",
  },
  {
    englishName: "Corn",
    banglaName: "মকাই",
    phoneticNames: ["Kor-n"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/40/Maize_cereal_grains.jpg",
    category: "American Ingredients",
    region: "America",
  },
  {
    englishName: "Maple Syrup",
    banglaName: "ম্যাপেল সিরাপ",
    phoneticNames: ["May-pul See-ruhp"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Maple_syrup.jpg",
    category: "American Ingredients",
    region: "America",
  },
  {
    englishName: "Saffron",
    banglaName: "জাফরান",
    phoneticNames: ["Zah-fraan"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/3c/Saffron_stigmas.jpg",
    category: "Pakistani Ingredients",
    region: "Pakistan",
  },
  {
    englishName: "Fenugreek Seeds",
    banglaName: "মেথি",
    phoneticNames: ["May-thee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/1f/Fenugreek_seeds.jpg",
    category: "Pakistani Ingredients",
    region: "Pakistan",
  },
  {
    englishName: "Semolina",
    banglaName: "সুজি",
    phoneticNames: ["Soo-jee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c4/Semolina.jpg",
    category: "Pakistani Ingredients",
    region: "Pakistan",
  },
  {
    englishName: "Chinese Five Spice",
    banglaName: "চীনা ফাইভ স্পাইস",
    phoneticNames: ["Chee-nah Five Spices"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/Five_spice_powder.jpg",
    category: "Chinese Ingredients",
    region: "China",
  },
  {
    englishName: "Soy Sauce",
    banglaName: "সয়া সস",
    phoneticNames: ["Soy Sauce"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/72/Soy_Sauce.jpg",
    category: "Chinese Ingredients",
    region: "China",
  },
  {
    englishName: "Tofu",
    banglaName: "টোফু",
    phoneticNames: ["Toh-foo"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Tofu_in_Soup.jpg",
    category: "Chinese Ingredients",
    region: "China",
  },
  {
    englishName: "Wasabi",
    banglaName: "ওসাবি",
    phoneticNames: ["Wah-sah-bee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Wasabi.png",
    category: "Japanese/Chinese Ingredients",
    region: "China",
  },
  {
    englishName: "Cilantro",
    banglaName: "ধনে পাতা",
    phoneticNames: ["Dho-ne Paa-ta"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/6b/Coriander_leaves.jpg",
    category: "Global Herbs",
    region: "Global",
  },
  {
    englishName: "Mint",
    banglaName: "পুদিনা",
    phoneticNames: ["Poo-dee-na"],
    imageLink: "https://upload.wikimedia.org/wikipedia/commons/7/76/Mint.png",
    category: "Global Herbs",
    region: "Global",
  },
  {
    englishName: "Dried Ribbon Fish",
    banglaName: "ছুরি শুঁটকি",
    phoneticNames: ["Choo-ree Shoot-kee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/Dried_Ribbon_fish.JPG",
    category: "Dried Fish",
    region: "Bangladesh and India",
  },
  {
    englishName: "Dried Bombay Duck",
    banglaName: "লয়টা শুঁটকি",
    phoneticNames: ["Loyt-tah Shoot-kee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/23/Dried_Harpadon_nehereus.jpg",
    category: "Dried Fish",
    region: "Bangladesh and India",
  },
  {
    englishName: "Dried Prawns",
    banglaName: "চিংড়ি শুঁটকি",
    phoneticNames: ["Ching-ree Shoot-kee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Dried_prawns_for_sale.jpg",
    category: "Dried Fish",
    region: "Bangladesh and India",
  },
  {
    englishName: "Fermented Fish Paste",
    banglaName: "শিদল",
    phoneticNames: ["Shee-dol"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/6d/Shidal_fermented_fish.jpg",
    category: "Dried Fish",
    region: "Bangladesh and India",
  },
  {
    englishName: "Dried Barb Fish",
    banglaName: "পুটি শুঁটকি",
    phoneticNames: ["Poo-tee Shoot-kee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Dried_Puntius_sophore.jpg",
    category: "Dried Fish",
    region: "Bangladesh and India",
  },
  {
    englishName: "Water Spinach",
    banglaName: "কলমি শাক",
    phoneticNames: ["Kol-mee Shaak"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/7d/Ipomoea_aquatica_leaves.jpg",
    category: "Regional Leafy Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "Jute Leaves",
    banglaName: "পাতা শাক",
    phoneticNames: ["Paat Shaak"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/55/Corchorus_olitorius_leaves.jpg",
    category: "Regional Leafy Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "Bottle Gourd Greens",
    banglaName: "লাউ শাক",
    phoneticNames: ["Laoo Shaak"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/82/Bottle_gourd_leaves.jpg",
    category: "Regional Leafy Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pumpkin Leaves",
    banglaName: "কুমড়া শাক",
    phoneticNames: ["Koom-rah Shaak"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4e/Pumpkin_Leaves.jpg",
    category: "Regional Leafy Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "Brahmi Leaves",
    banglaName: "থনুনি পাতা",
    phoneticNames: ["Thaan-koo-nee Paa-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Centella_asiatica_leaves.jpg",
    category: "Regional Leafy Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "Date Palm Jaggery",
    banglaName: "খেজুর গুড়",
    phoneticNames: ["Kay-joor Goor"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/ae/Date_Palm_Jaggery.jpg",
    category: "Sweeteners & Jaggery",
    region: "Bangladesh and India",
  },
  {
    englishName: "Solid Date Jaggery",
    banglaName: "পাটালি গুড়",
    phoneticNames: ["Puh-tah-lee Goor"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/75/Patali_Gur.jpg",
    category: "Sweeteners & Jaggery",
    region: "Bangladesh and India",
  },
  {
    englishName: "Cane Jaggery",
    banglaName: "আখের গুড়",
    phoneticNames: ["Aa-khayr Goor"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/36/Jaggery_Blocks.jpg",
    category: "Sweeteners & Jaggery",
    region: "Bangladesh and India",
  },
  {
    englishName: "Liquid Jaggery",
    banglaName: "নোলেন গুড়",
    phoneticNames: ["No-layn Goor"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Liquid_Jaggery.JPG",
    category: "Sweeteners & Jaggery",
    region: "Bangladesh and India",
  },
  {
    englishName: "Cashew Nuts",
    banglaName: "কাজু বাদাম",
    phoneticNames: ["Kaa-joo Baa-daam"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Cashew_nuts.jpg",
    category: "Nuts & Oilseeds",
    region: "Bangladesh and India",
  },
  {
    englishName: "Peanuts",
    banglaName: "চিনা বাদাম",
    phoneticNames: ["Chee-naa Baa-daam"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/Peanut_kernels.jpg",
    category: "Nuts & Oilseeds",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pistachios",
    banglaName: "পেস্তা বাদাম",
    phoneticNames: ["Pays-tah Baa-daam"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/df/Pistachio_nuts.jpg",
    category: "Nuts & Oilseeds",
    region: "Bangladesh and India",
  },
  {
    englishName: "Banana Blossom",
    banglaName: "মোচা",
    phoneticNames: ["Mo-chaa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Banana_Flower.jpg",
    category: "Culinary Flowers",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pumpkin Flower",
    banglaName: "কুমড়া ফুল",
    phoneticNames: ["Koom-rah Phool"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/43/Squash_Blossom.jpg",
    category: "Culinary Flowers",
    region: "Bangladesh and India",
  },
  {
    englishName: "Moringa Flower",
    banglaName: "সজনে ফুল",
    phoneticNames: ["Saj-nay Phool"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Moringa_oleifera_flowers.jpg",
    category: "Culinary Flowers",
    region: "Bangladesh and India",
  },
  {
    englishName: "Ghost Pepper",
    banglaName: "ভূত জলকিয়া",
    phoneticNames: ["Bhoot Jo-lo-kee-yah", "Nah-gah Mo-reech"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/23/Bhut_Jolokia_peppers.jpg",
    category: "Chili Peppers & Heat",
    region: "Bangladesh and India",
  },
  {
    englishName: "Green Chili",
    banglaName: "কাঁচা মরিচ",
    phoneticNames: ["Kaa-chaa Mo-reech"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e4/Green_chilli_peppers.jpg",
    category: "Chili Peppers & Heat",
    region: "Bangladesh and India",
  },
  {
    englishName: "Dried Red Chili",
    banglaName: "শুকনা মরিচ",
    phoneticNames: ["Shook-no Mo-reech"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/f/f9/Dried_red_chilis.jpg",
    category: "Chili Peppers & Heat",
    region: "Bangladesh and India",
  },
  {
    englishName: "Kashmiri Red Chili",
    banglaName: "কাশ্মীরি লঙ্কা",
    phoneticNames: ["Kash-mee-ree Meerch"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Dried_Kashmiri_chili.jpg",
    category: "Chili Peppers & Heat",
    region: "Bangladesh and India",
  },
  {
    englishName: "Bullet Chili",
    banglaName: "বুলেট মরিচ",
    phoneticNames: ["Bool-let Mo-reech"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/df/Thai_bird%27s_eye_chili.jpg",
    category: "Chili Peppers & Heat",
    region: "Bangladesh and India",
  },
  {
    englishName: "Mango Pickle",
    banglaName: "আমের অচা",
    phoneticNames: ["Aa-mayr Aa-chaar"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/36/Mango_Pickle_Indian.jpg",
    category: "Regional Pickles & Preserves",
    region: "Bangladesh and India",
  },
  {
    englishName: "Garlic Pickle",
    banglaName: "রসুনির অচা",
    phoneticNames: ["Ro-shoo-neer Aa-chaar"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c9/Garlic_pickle.jpg",
    category: "Regional Pickles & Preserves",
    region: "Bangladesh and India",
  },
  {
    englishName: "Lime Pickle",
    banglaName: "লেবুর অচা",
    phoneticNames: ["Lay-boor Aa-chaar"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/f/f7/Lime_Pickle.jpg",
    category: "Regional Pickles & Preserves",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sweet Jujube Preserve",
    banglaName: "বড়ইয়ের মোরব্বা",
    phoneticNames: ["Bo-ro-yeer Mo-rob-bah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e3/Ziziphus_mauritiana_fruits.jpg",
    category: "Regional Pickles & Preserves",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sweet Basil",
    banglaName: "তুলসী",
    phoneticNames: ["Tool-shee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/de/Tulsi_leaves.JPG",
    category: "Wild Herbs & Aromatics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Mint Leaves",
    banglaName: "পুদিনা পাতা",
    phoneticNames: ["Poo-dee-nah Paa-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Mint-leaves.jpg",
    category: "Wild Herbs & Aromatics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Coriander Leaves",
    banglaName: "ধনেপাতা",
    phoneticNames: ["Dho-nay Paa-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/85/Coriander_leaves.jpg",
    category: "Wild Herbs & Aromatics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Curry Leaves",
    banglaName: "কারি পাতা",
    phoneticNames: ["Cur-ree Put-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Murraya_koenigii_leaves.JPG",
    category: "Wild Herbs & Aromatics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Betel Leaf",
    banglaName: "পান",
    phoneticNames: ["Paan"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/Betel_leaves_in_market.jpg",
    category: "Digestives & Mouth Fresheners",
    region: "Bangladesh and India",
  },
  {
    englishName: "Areca Nut",
    banglaName: "সুপারি",
    phoneticNames: ["Shoo-pah-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Areca_nuts_market.jpg",
    category: "Digestives & Mouth Fresheners",
    region: "Bangladesh and India",
  },
  {
    englishName: "Slaked Lime",
    banglaName: "চুন",
    phoneticNames: ["Choon"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Lime_edible_paste.jpg",
    category: "Digestives & Mouth Fresheners",
    region: "Bangladesh and India",
  },
  {
    englishName: "Catechu",
    banglaName: "খোয়ের",
    phoneticNames: ["Khoy-ayr"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/63/Catechu_pieces.jpg",
    category: "Digestives & Mouth Fresheners",
    region: "Bangladesh and India",
  },
  {
    englishName: "Bamboo Shoots",
    banglaName: "বাঁশ কোরোল",
    phoneticNames: ["Baansh Ko-rol"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/62/Bamboo_shoots.jpg",
    category: "Wild Forest Products",
    region: "Bangladesh and India",
  },
  {
    englishName: "Wild Mushroom",
    banglaName: "বাংয়ের ছাতা",
    phoneticNames: ["Baang-ayr Chhaa-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/8e/Wild_mushrooms_India.jpg",
    category: "Wild Forest Products",
    region: "Bangladesh and India",
  },
  {
    englishName: "Ash Gourd Lentil Dumplings",
    banglaName: "কুমড়ো বোরি",
    phoneticNames: ["Koom-roh Bo-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4e/Kumro_Bori.jpg",
    category: "Sun-Dried Lentil Cakes (Bori)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Spiced Lentil Drops",
    banglaName: "মসলা বোরি",
    phoneticNames: ["Muh-sah-lah Bo-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Dried_lentil_dumplings.jpg",
    category: "Sun-Dried Lentil Cakes (Bori)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Black Gram Dumplings",
    banglaName: "বিউলির ডালের বোরি",
    phoneticNames: ["Bee-oo-leer Daal-ayr Bo-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/0f/Dal_bori.jpg",
    category: "Sun-Dried Lentil Cakes (Bori)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sweet Potato",
    banglaName: "মিষ্টি আলু",
    phoneticNames: ["Mish-tee Aa-loo"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/af/Sweet_potato.jpg",
    category: "Tubers & Root Vegetables",
    region: "Bangladesh and India",
  },
  {
    englishName: "Purple Yam",
    banglaName: "রাঙা আলু",
    phoneticNames: ["Raang-gaa Aa-loo"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/6e/Dioscorea_alata_bulbil.jpg",
    category: "Tubers & Root Vegetables",
    region: "Bangladesh and India",
  },
  {
    englishName: "Cassava",
    banglaName: "শিমুল আলু",
    phoneticNames: ["Shee-mool Aa-loo"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/83/Cassava_roots.jpg",
    category: "Tubers & Root Vegetables",
    region: "Bangladesh and India",
  },
  {
    englishName: "Taro Root",
    banglaName: "কচু",
    phoneticNames: ["Kuh-choo"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Taro_root.jpg",
    category: "Tubers & Root Vegetables",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pink Himalayan Salt",
    banglaName: "সেন্দা নমক",
    phoneticNames: ["Sayn-dha Nuh-muk"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/77/Himalayan_salt.jpg",
    category: "Specialty Salts & Mineral Additives",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sea Salt (Coarse)",
    banglaName: "কারকাচ লবণ",
    phoneticNames: ["Kar-kuch Lo-bon"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Sea_salt_crystals.jpg",
    category: "Specialty Salts & Mineral Additives",
    region: "Bangladesh and India",
  },
  {
    englishName: "Alkali (Banana Ash Water)",
    banglaName: "কলের খার",
    phoneticNames: ["Kol-ayr Khaar"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Ash_Liquid_Alkali.jpg",
    category: "Traditional Cooking Agents",
    region: "Bangladesh and India",
  },
  {
    englishName: "Vinegar (Cane Based)",
    banglaName: "সিরকা",
    phoneticNames: ["Sheer-kah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Vinegar_bottle.jpg",
    category: "Traditional Cooking Agents",
    region: "Bangladesh and India",
  },
  {
    englishName: "Cape Gooseberry",
    banglaName: "টাপারি",
    phoneticNames: ["Tuh-pah-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/9/91/Physalis_peruviana_fruit.jpg",
    category: "Regional Berries & Small Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Water Chestnut",
    banglaName: "পানিফল",
    phoneticNames: ["Paa-nee-ful", "Sing-ga-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/53/Trapa_natans_fruit.jpg",
    category: "Regional Berries & Small Fruits",
    region: "Bangladesh and India",
  },
  {
    englishName: "Fermented Mustard Sauce",
    banglaName: "Kasundi",
    phoneticNames: ["Kuh-shoon-dee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Kasundi_in_a_bowl.jpg",
    category: "Mustard Pastes & Ferments",
    region: "Bangladesh and India",
  },
  {
    englishName: "Mustard Paste (Fresh)",
    banglaName: "Shorshe Bata",
    phoneticNames: ["Shor-shay Baa-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/6f/Mustard_seeds_yellow.jpg",
    category: "Mustard Pastes & Ferments",
    region: "Bangladesh and India",
  },
  {
    englishName: "Mango-Mustard Relish",
    banglaName: "Aam-Kasundi",
    phoneticNames: ["Aam Kuh-shoon-dee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/da/Green_mango_kasundi.jpg",
    category: "Mustard Pastes & Ferments",
    region: "Bangladesh and India",
  },
  {
    englishName: "Hyacinth Bean / Flat Bean",
    banglaName: "Sim",
    phoneticNames: ["Sheem"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Lablab_purpureus_beans.jpg",
    category: "Regional Beans & Pods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Long Beans",
    banglaName: "Borgoti",
    phoneticNames: ["Bor-bo-tee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/b2/Vigna_unguiculata_sesquipedalis_02.JPG",
    category: "Regional Beans & Pods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Cluster Beans",
    banglaName: "Gowar",
    phoneticNames: ["Go-aar"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/07/Cyamopsis_tetragonoloba_pods.jpg",
    category: "Regional Beans & Pods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Green Peas (Fresh)",
    banglaName: "Koraishuti",
    phoneticNames: ["Ko-rai-shoo-tee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c1/Green_peas_in_pod.jpg",
    category: "Regional Beans & Pods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Ash Gourd / Winter Melon",
    banglaName: "Chalkumra",
    phoneticNames: ["Chaal-koom-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/f/ff/Benincasa_hispida_fruit.JPG",
    category: "Pumpkins & Winter Melons",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sweet Pumpkin",
    banglaName: "Misti Kumra",
    phoneticNames: ["Meesh-tee Koom-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/5c/Cucurbita_maxima_South_Asia.jpg",
    category: "Pumpkins & Winter Melons",
    region: "Bangladesh and India",
  },
  {
    englishName: "Crispy Fried Onions",
    banglaName: "Beresta",
    phoneticNames: ["Bay-raysh-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e1/Fried_Onion_Slices.jpg",
    category: "Mughlai Meat Garnishes",
    region: "Bangladesh and India",
  },
  {
    englishName: "Silver Leaf (Edible)",
    banglaName: "Chandi vark",
    phoneticNames: ["Chaan-dee Vark"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/Vark_silver_leaf.jpg",
    category: "Mughlai Meat Garnishes",
    region: "Bangladesh and India",
  },
  {
    englishName: "Bilimbi",
    banglaName: "Bilimbi",
    phoneticNames: ["Bee-leem-bee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Averrhoa_bilimbi_fruit.JPG",
    category: "Village Fruits & Sours",
    region: "Bangladesh and India",
  },
  {
    englishName: "Dillenia Indica (Elephant Apple)",
    banglaName: "Chalta",
    phoneticNames: ["Chaal-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a3/Dillenia_indica_fruit_2.jpg",
    category: "Village Fruits & Sours",
    region: "Bangladesh and India",
  },
  {
    englishName: "Spiced Yogurt Drink",
    banglaName: "Borhani",
    phoneticNames: ["Bor-haa-nee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/ea/Borhani_Drink.jpg",
    category: "Traditional Beverages & Dairy Drinks",
    region: "Bangladesh and India",
  },
  {
    englishName: "Cultured Buttermilk",
    banglaName: "Ghol",
    phoneticNames: ["Ghole", "Chhaa-sh"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Glass_of_Chaas.jpg",
    category: "Traditional Beverages & Dairy Drinks",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sweet Lassi",
    banglaName: "Mishti Lassi",
    phoneticNames: ["Mish-tee Lush-shee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a4/Lassi_glass.jpg",
    category: "Traditional Beverages & Dairy Drinks",
    region: "Bangladesh and India",
  },
  {
    englishName: "Whey",
    banglaName: "Chhanar Jol",
    phoneticNames: ["Chhaa-naar Jol"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/23/Whey_liquid.jpg",
    category: "Traditional Beverages & Dairy Drinks",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sagar Banana",
    banglaName: "Sagor Kola",
    phoneticNames: ["Shah-gor Ko-lah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg",
    category: "Regional Banana Varieties (Kola)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Champa Banana",
    banglaName: "Champa Kola",
    phoneticNames: ["Chum-pah Ko-lah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/6f/Small_bananas.jpg",
    category: "Regional Banana Varieties (Kola)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sabri Banana",
    banglaName: "Sabri Kola",
    phoneticNames: ["Shub-ree Ko-lah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/f/ff/Banana_and_cross_section.jpg",
    category: "Regional Banana Varieties (Kola)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Cooking Plantain",
    banglaName: "Kacha Kola",
    phoneticNames: ["Kaa-chaa Ko-lah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a5/Green_banana.jpg",
    category: "Regional Banana Varieties (Kola)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Himsagar Mango",
    banglaName: "Himsagar",
    phoneticNames: ["Heem-shah-gor"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/f/fb/Mango_Alphonso_Asit.jpg",
    category: "Mango Cultivars (Amer Jaat)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Langra Mango",
    banglaName: "Langra",
    phoneticNames: ["Laang-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/ee/Mango_Langra.jpg",
    category: "Mango Cultivars (Amer Jaat)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Amrapali Mango",
    banglaName: "Amrapali",
    phoneticNames: ["Aam-rah-pa-lee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/41/Amrapali_Mango.jpg",
    category: "Mango Cultivars (Amer Jaat)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Fazli Mango",
    banglaName: "Fazli",
    phoneticNames: ["Foj-lee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a3/Fazli_Mango.jpg",
    category: "Mango Cultivars (Amer Jaat)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Dried Mango Leather",
    banglaName: "Aamsotto",
    phoneticNames: ["Aam-shot-toh"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/7e/Aam_papad.jpg",
    category: "Preserved Fruits & Pulps",
    region: "Bangladesh and India",
  },
  {
    englishName: "Dried Mango Slices (Salted)",
    banglaName: "Aamsi",
    phoneticNames: ["Aam-shee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/69/Dried_mango_strips.jpg",
    category: "Preserved Fruits & Pulps",
    region: "Bangladesh and India",
  },
  {
    englishName: "Water Lily Seeds",
    banglaName: "Makhana",
    phoneticNames: ["Muh-khaa-nah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/Phool_Makhana.jpg",
    category: "Native Forest Seeds & Berries",
    region: "Bangladesh and India",
  },
  {
    englishName: "Custard Apple",
    banglaName: "Sharifa",
    phoneticNames: ["Sha-ree-fah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Sugar_apple.JPG",
    category: "Native Forest Seeds & Berries",
    region: "Bangladesh and India",
  },
  {
    englishName: "Bombay Duck",
    banglaName: "Loitta",
    phoneticNames: ["Loyt-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/23/Dried_Harpadon_nehereus.jpg",
    category: "Coastal & Marine Fish (Bay of Bengal)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pomfret (Silver)",
    banglaName: "Rupchanda",
    phoneticNames: ["Roop-chaan-dah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e3/Pampus_argenteus.jpg",
    category: "Coastal & Marine Fish (Bay of Bengal)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Ribbon Fish",
    banglaName: "Chhuri Machh",
    phoneticNames: ["Choo-ree Maach"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/3a/Trichiurus_lepturus.jpg",
    category: "Coastal & Marine Fish (Bay of Bengal)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Red Snapper",
    banglaName: "Ranga Koral",
    phoneticNames: ["Raang-gah Ko-raal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/aa/Lutjanus_campechanus.jpg",
    category: "Coastal & Marine Fish (Bay of Bengal)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Air Potato / Wild Yam",
    banglaName: "Gach Alu",
    phoneticNames: ["Gaach Aa-loo"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Dioscorea_bulbifera_yam.jpg",
    category: "Wild Forest Tubers (Gach Alu)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Elephant Foot Yam",
    banglaName: "Ol",
    phoneticNames: ["Oal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Elephant_foot_yam.jpg",
    category: "Wild Forest Tubers (Gach Alu)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Taro Stems (Dried)",
    banglaName: "Kachu Shol",
    phoneticNames: ["Kuh-choo Shol"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/Colocasia_esculenta_stems.jpg",
    category: "Wild Forest Tubers (Gach Alu)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Garlic Pate",
    banglaName: "Rosun Bhorta",
    phoneticNames: ["Ro-shoon Bhor-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Garlic_cloves_raw.jpg",
    category: "Traditional Chutneys & Pates",
    region: "Bangladesh and India",
  },
  {
    englishName: "Coriander Chutney",
    banglaName: "Dhoney Patar Chutney",
    phoneticNames: ["Dho-nay Paa-taar Chut-nee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/35/Coriander_Chutney.jpg",
    category: "Traditional Chutneys & Pates",
    region: "Bangladesh and India",
  },
  {
    englishName: "Black Seed Paste",
    banglaName: "Kalo Jeera Bhorta",
    phoneticNames: ["Kaa-lo Jee-rah Bhor-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/86/Nigella_seeds.jpg",
    category: "Traditional Chutneys & Pates",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sugar Syrup Cherries",
    banglaName: "Morobba",
    phoneticNames: ["Mo-rob-bah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c9/Morabba_preserved_fruit.jpg",
    category: "Heritage Sweet Preserves",
    region: "Bangladesh and India",
  },
  {
    englishName: "Wax Gourd Candy",
    banglaName: "Petha",
    phoneticNames: ["Pay-thah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/23/Petha_sweet.jpg",
    category: "Heritage Sweet Preserves",
    region: "Bangladesh and India",
  },
  {
    englishName: "Earthen Pot",
    banglaName: "Matir Patil",
    phoneticNames: ["Maa-teer Paa-teel"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Earthen_pots_South_Asia.jpg",
    category: "Village Cooking Fuel & Tools",
    region: "Bangladesh and India",
  },
  {
    englishName: "Iron Wok",
    banglaName: "Loher Korai",
    phoneticNames: ["Lo-hayr Ko-rai"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c1/Karahi_iron_wok.jpg",
    category: "Village Cooking Fuel & Tools",
    region: "Bangladesh and India",
  },
  {
    englishName: "Wild Ginger Flower",
    banglaName: "Tora Phool",
    phoneticNames: ["To-rah Phool"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Etlingera_elatior_flower.jpg",
    category: "Hill Tracts & Tribal Aromatics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Stink Beans",
    banglaName: "Yongchak",
    phoneticNames: ["Yong-chak"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Parkia_speciosa_seeds.jpg",
    category: "Hill Tracts & Tribal Aromatics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Bird's Eye Chili (Super Hot)",
    banglaName: "Dhoni Morich",
    phoneticNames: ["Dho-nee Mo-reech"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/22/Prik_ki_nu_peppers.jpg",
    category: "Hill Tracts & Tribal Aromatics",
    region: "Bangladesh and India",
  },
  {
    englishName: "Red Rice Flour",
    banglaName: "Lal Chaler Gura",
    phoneticNames: ["Laal Chaa-layr Goo-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Unpolished_Rice.JPG",
    category: "Winter Pitha (Rice Cake) Essentials",
    region: "Bangladesh and India",
  },
  {
    englishName: "Scraped Coconut (Fine)",
    banglaName: "Narkeler Chhai",
    phoneticNames: ["Naar-kay-layr Chhai"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/Grated_coconut.jpg",
    category: "Winter Pitha (Rice Cake) Essentials",
    region: "Bangladesh and India",
  },
  {
    englishName: "Date Palm Sap",
    banglaName: "Khejur Rosh",
    phoneticNames: ["Kay-joor Rosh"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Date_palm_sap_collection.jpg",
    category: "Winter Pitha (Rice Cake) Essentials",
    region: "Bangladesh and India",
  },
  {
    englishName: "Mangrove Honey",
    banglaName: "Boner Modhu",
    phoneticNames: ["Bo-nayr Mo-dhoo"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c2/Honey_jar.jpg",
    category: "Sundarbans & Forest Foraged",
    region: "Bangladesh and India",
  },
  {
    englishName: "Wax Gourd (Forest Variety)",
    banglaName: "Bon Kumra",
    phoneticNames: ["Bon Koom-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/f/ff/Benincasa_hispida_fruit.JPG",
    category: "Sundarbans & Forest Foraged",
    region: "Bangladesh and India",
  },
  {
    englishName: "Foxtail Millet",
    banglaName: "Kaoner Chal",
    phoneticNames: ["Ka-on-ayr Chaal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/82/Setaria_italica_seeds.jpg",
    category: "Ancient Seeds & Grains",
    region: "Bangladesh and India",
  },
  {
    englishName: "Barnyard Millet",
    banglaName: "Shyama Chal",
    phoneticNames: ["Shyama Chaal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/87/Echinochloa_esculenta_seeds.jpg",
    category: "Ancient Seeds & Grains",
    region: "Bangladesh and India",
  },
  {
    englishName: "Edible Gum",
    banglaName: "Gond",
    phoneticNames: ["Gond"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e4/Edible_gum_pieces.jpg",
    category: "Specialized Sweetening Gums",
    region: "Bangladesh and India",
  },
  {
    englishName: "Tragacanth Gum",
    banglaName: "Katila Gam",
    phoneticNames: ["Kuh-tee-lah Gum"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Tragacanth_gum.jpg",
    category: "Specialized Sweetening Gums",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sesbania Grandiflora Flower",
    banglaName: "Bok Phool",
    phoneticNames: ["Bok Phool"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Sesbania_grandiflora_flowers.jpg",
    category: "Flower & Vegetable Fritter (Bora) Bases",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pumpkin Blossom",
    banglaName: "Kumro Phool",
    phoneticNames: ["Koom-roh Phool"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/43/Squash_Blossom.jpg",
    category: "Flower & Vegetable Fritter (Bora) Bases",
    region: "Bangladesh and India",
  },
  {
    englishName: "Onion Stalks",
    banglaName: "Peyajkoli",
    phoneticNames: ["Pay-yaaj-ko-lee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/ae/Onion_stalks_fresh.jpg",
    category: "Flower & Vegetable Fritter (Bora) Bases",
    region: "Bangladesh and India",
  },
  {
    englishName: "Mashed Potato Balls",
    banglaName: "Alur Chop",
    phoneticNames: ["Aa-loor Chop"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/36/Alur_Chop.jpg",
    category: "Flower & Vegetable Fritter (Bora) Bases",
    region: "Bangladesh and India",
  },
  {
    englishName: "Star Gooseberry",
    banglaName: "Orboroi",
    phoneticNames: ["Or-bo-roy"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/37/Phyllanthus_acidus_fruit.jpg",
    category: "Souring Agents for Tok & Dal",
    region: "Bangladesh and India",
  },
  {
    englishName: "Indian Olive",
    banglaName: "Jalpai",
    phoneticNames: ["Jol-paye"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Elaeocarpus_serratus_fruit.jpg",
    category: "Souring Agents for Tok & Dal",
    region: "Bangladesh and India",
  },
  {
    englishName: "Ambadi (Sorrel Leaves)",
    banglaName: "Mesta Shak",
    phoneticNames: ["Mays-tah Shaak"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/15/Roselle_leaves_Hibiscus.jpg",
    category: "Souring Agents for Tok & Dal",
    region: "Bangladesh and India",
  },
  {
    englishName: "Garcinia Pedunculata",
    banglaName: "Thekera",
    phoneticNames: ["Thay-kay-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/Garcinia_indica_dried.jpg",
    category: "Souring Agents for Tok & Dal",
    region: "Bangladesh and India",
  },
  {
    englishName: "Carom Seeds",
    banglaName: "Joain",
    phoneticNames: ["Jo-ayin"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Ajwain_seeds.jpg",
    category: "Medicinal Pantry Staples (Kitchen Pharmacy)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Indian Borage",
    banglaName: "Patharkuchi",
    phoneticNames: ["Puh-thar-koo-chee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/87/Plectranthus_amboinicus_leaves.jpg",
    category: "Medicinal Pantry Staples (Kitchen Pharmacy)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Neem Leaves (Bitter)",
    banglaName: "Neem Pata",
    phoneticNames: ["Neem Paa-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/bd/Neem_leaves.jpg",
    category: "Medicinal Pantry Staples (Kitchen Pharmacy)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Tallow / Beef Fat",
    banglaName: "Gorur Chorbi",
    phoneticNames: ["Go-roor Chor-bee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/ee/Beef_tallow.jpg",
    category: "Animal Fats & Traditional Extracts",
    region: "Bangladesh and India",
  },
  {
    englishName: "Fish Oil (Natural)",
    banglaName: "Macher Tel",
    phoneticNames: ["Maa-chher Tail"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/f/ff/Fish_oil_liquid.jpg",
    category: "Animal Fats & Traditional Extracts",
    region: "Bangladesh and India",
  },
  {
    englishName: "Long Pepper",
    banglaName: "Choi Jhal",
    phoneticNames: ["Choy Jhaal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/ae/Piper_longum_dried.jpg",
    category: "Indigenous Peppers & Pods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sichuan Pepper (Regional Var)",
    banglaName: "Tejphal",
    phoneticNames: ["Tayj-ful"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/aa/Zanthoxylum_bungeanum_dried.jpg",
    category: "Indigenous Peppers & Pods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Small Native Onion",
    banglaName: "Deshi Peyaj",
    phoneticNames: ["Day-shee Pay-yaaj"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/51/Shallots_market.jpg",
    category: "Specific Allium Varieties (Aromatics)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Native Garlic (Small Clove)",
    banglaName: "Deshi Rosun",
    phoneticNames: ["Day-shee Ro-shoon"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/22/Garlic_cloves_small.jpg",
    category: "Specific Allium Varieties (Aromatics)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Garlic Chives",
    banglaName: "Gondho Pata",
    phoneticNames: ["Gon-dho Paa-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/9/90/Allium_tuberosum_leaves.jpg",
    category: "Specific Allium Varieties (Aromatics)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Hyacinth Bean Seeds (Dried)",
    banglaName: "Sim-er Bichi",
    phoneticNames: ["Sheem-ayr Bee-chee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4b/Lablab_purpureus_seeds.jpg",
    category: "Heritage Pulses & Bean Seeds",
    region: "Bangladesh and India",
  },
  {
    englishName: "Jackfruit Seeds",
    banglaName: "Kathal-er Bichi",
    phoneticNames: ["Kaa-thaal-ayr Bee-chee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/6/6f/Jackfruit_seeds_dried.jpg",
    category: "Heritage Pulses & Bean Seeds",
    region: "Bangladesh and India",
  },
  {
    englishName: "Black-eyed Peas",
    banglaName: "Lobia",
    phoneticNames: ["Lo-bee-yah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/0f/Black-eyed_peas.jpg",
    category: "Heritage Pulses & Bean Seeds",
    region: "Bangladesh and India",
  },
  {
    englishName: "Granulated Date Jaggery",
    banglaName: "Dana Gur",
    phoneticNames: ["Daa-nah Goor"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/7/75/Patali_Gur.jpg",
    category: "Winter Molasses & Sap Products",
    region: "Bangladesh and India",
  },
  {
    englishName: "Palm Sugar Candy",
    banglaName: "Tal Michri",
    phoneticNames: ["Taal Meesh-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Palm_sugar_crystals.jpg",
    category: "Winter Molasses & Sap Products",
    region: "Bangladesh and India",
  },
  {
    englishName: "Tamarind Seeds (Roasted)",
    banglaName: "Tetul Bichi",
    phoneticNames: ["Tay-tool Bee-chee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/b2/Tamarind_seeds.jpg",
    category: "Traditional Starch & Thickening Seeds",
    region: "Bangladesh and India",
  },
  {
    englishName: "Lotus Seeds",
    banglaName: "Poddo Bichi",
    phoneticNames: ["Pod-doh Bee-chee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Lotus_seeds_dried.jpg",
    category: "Traditional Starch & Thickening Seeds",
    region: "Bangladesh and India",
  },
  {
    englishName: "Black Mustard Oil (First Press)",
    banglaName: "Ghani Bhanga Tel",
    phoneticNames: ["Gha-nee Bhung-gaa Tail"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/Mustard_oil_in_glass.jpg",
    category: "Fermented & Special Oils",
    region: "Bangladesh and India",
  },
  {
    englishName: "Clarified Goat Butter",
    banglaName: "Khashir Ghee",
    phoneticNames: ["Khaa-sheer Ghee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Ghee_bowl.jpg",
    category: "Fermented & Special Oils",
    region: "Bangladesh and India",
  },
  {
    englishName: "Miniket Rice",
    banglaName: "Miniket Chal",
    phoneticNames: ["Mee-nee-kayt Chaal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/b0/Parboiled_rice.JPG",
    category: "Specific Rice Cultivars (Varying Textures)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Najirshail Rice",
    banglaName: "Najirshail",
    phoneticNames: ["Nah-jeer-shail"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Unpolished_Rice.JPG",
    category: "Specific Rice Cultivars (Varying Textures)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sticky Rice (Biroi)",
    banglaName: "Binni Chal",
    phoneticNames: ["Been-nee Chaal"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e2/Sticky_rice_in_basket.JPG",
    category: "Specific Rice Cultivars (Varying Textures)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Govindabhog Rice",
    banglaName: "Gobindobhog",
    phoneticNames: ["Go-been-do-bhog"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Gobindobhog_rice.jpg",
    category: "Specific Rice Cultivars (Varying Textures)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Dhaka Flatbread",
    banglaName: "Bakorkhani",
    phoneticNames: ["Buh-kor-khaa-nee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/0d/Bakarkhani_of_Old_Dhaka.JPG",
    category: "Regional Breads & Baked Goods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Puffed Leavened Bread",
    banglaName: "Luchi",
    phoneticNames: ["Loo-chee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Luchi_with_curry.JPG",
    category: "Regional Breads & Baked Goods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Flaky Layered Bread",
    banglaName: "Paratha",
    phoneticNames: ["Pu-rah-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d1/Paratha_on_plate.jpg",
    category: "Regional Breads & Baked Goods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Steamed Rice Cake",
    banglaName: "Bhapa Pitha",
    phoneticNames: ["Bha-pa Pee-tha"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/aa/Bhapa_pitha.JPG",
    category: "Regional Breads & Baked Goods",
    region: "Bangladesh and India",
  },
  {
    englishName: "Native Chicken",
    banglaName: "Deshi Murgi",
    phoneticNames: ["Day-shee Moor-gee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Free_range_chicken_South_Asia.jpg",
    category: "Village Poultry & Eggs",
    region: "Bangladesh and India",
  },
  {
    englishName: "Duck Eggs",
    banglaName: "Hasher Dim",
    phoneticNames: ["Haa-shayr Deem"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Duck_eggs_in_basket.jpg",
    category: "Village Poultry & Eggs",
    region: "Bangladesh and India",
  },
  {
    englishName: "Coconut Oil (Cooking Grade)",
    banglaName: "Narkel Tel",
    phoneticNames: ["Naar-kayl Tail"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d0/Coconut_oil_and_coconuts.jpg",
    category: "Oils & Traditional Cooking Fats",
    region: "Bangladesh and India",
  },
  {
    englishName: "Soybean Oil",
    banglaName: "Soybean Tel",
    phoneticNames: ["Shoy-ah-been Tail"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Soybean_oil.jpg",
    category: "Oils & Traditional Cooking Fats",
    region: "Bangladesh and India",
  },
  {
    englishName: "Fern Shoots",
    banglaName: "Dhekhi Shak",
    phoneticNames: ["Day-kee Shaak"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/df/Fiddlehead_ferns.jpg",
    category: "Wild Forest & Swamp Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pennywort",
    banglaName: "Thankuni Pata",
    phoneticNames: ["Thaan-koo-nee Paa-tah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Centella_asiatica_leaves.jpg",
    category: "Wild Forest & Swamp Greens",
    region: "Bangladesh and India",
  },
  {
    englishName: "CTC Black Tea",
    banglaName: "Duna Cha",
    phoneticNames: ["Doo-nah Chaa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/46/Black_tea_leaves.JPG",
    category: "Tea & Infusions (The Daily Fuel)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sylhet Leaf Tea",
    banglaName: "Pata Cha",
    phoneticNames: ["Paa-tah Chaa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e4/Tea_leaves_dried.jpg",
    category: "Tea & Infusions (The Daily Fuel)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Fresh Ginger",
    banglaName: "Ada",
    phoneticNames: ["Aa-daa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/5/5e/Ginger_Root.jpg",
    category: "Tea & Infusions (The Daily Fuel)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Condensed Milk",
    banglaName: "Khaura Dudh",
    phoneticNames: ["Khaw-rah Doodh"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/Condensed_milk_in_glass.jpg",
    category: "Tea & Infusions (The Daily Fuel)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Kewra Water",
    banglaName: "Kewra Jol",
    phoneticNames: ["Kay-ora Jol"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Pandanus_odorifer_water.jpg",
    category: "Aromatic Distillates (Biryani Essentials)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Rose Water",
    banglaName: "Golap Jol",
    phoneticNames: ["Go-laap Jol"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/02/Rose_water_bottle.jpg",
    category: "Aromatic Distillates (Biryani Essentials)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Edible Rose Petals",
    banglaName: "Golap-er Papri",
    phoneticNames: ["Go-laap-er Pup-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Dried_Rose_Petals.jpg",
    category: "Aromatic Distillates (Biryani Essentials)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Fried Lentil Noodles",
    banglaName: "Sev",
    phoneticNames: ["Shayv"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Sev_snack.jpg",
    category: "Savory Snack Bases (Chanachur/Namkeen)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Fried Green Mung",
    banglaName: "Moong Dal Bhaja",
    phoneticNames: ["Moong Daal Bhaa-jaa"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/cc/Fried_Moong_Dal.jpg",
    category: "Savory Snack Bases (Chanachur/Namkeen)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Boondi (Gram Flour Spheres)",
    banglaName: "Boondiya",
    phoneticNames: ["Boon-dee-yah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Boondi.jpg",
    category: "Savory Snack Bases (Chanachur/Namkeen)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Arrowroot Powder",
    banglaName: "Ararot",
    phoneticNames: ["Aa-rah-rot"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/a/af/Arrowroot_powder.jpg",
    category: "Thickening Agents & Stabilizers",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sago Pearls",
    banglaName: "Sabudana",
    phoneticNames: ["Sa-boo-daa-nah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Sago_pearls.jpg",
    category: "Thickening Agents & Stabilizers",
    region: "Bangladesh and India",
  },
  {
    englishName: "Fennel Candy",
    banglaName: "Mouri Michri",
    phoneticNames: ["Mow-ree Meesh-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/00/Coated_fennel_seeds.jpg",
    category: "Regional Sweet Infusions",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sugar Candy",
    banglaName: "Michri",
    phoneticNames: ["Meesh-ree"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/36/Rock_candy_mishti.jpg",
    category: "Regional Sweet Infusions",
    region: "Bangladesh and India",
  },
  {
    englishName: "Raw Papaya",
    banglaName: "Pepe",
    phoneticNames: ["Pay-pay"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/e6/Green_papaya.jpg",
    category: "Kebab Spices & Tenderizers",
    region: "Bangladesh and India",
  },
  {
    englishName: "Kabab Chinni (Allspice)",
    banglaName: "Kabab Chinni",
    phoneticNames: ["Kuh-baab Chee-nee"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/df/Pimenta_dioica_dried_berries.jpg",
    category: "Kebab Spices & Tenderizers",
    region: "Bangladesh and India",
  },
  {
    englishName: "Black Stone Flower",
    banglaName: "Pathar Phool",
    phoneticNames: ["Puh-thar Phool"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Parmotrema_perlatum_dried.jpg",
    category: "Kebab Spices & Tenderizers",
    region: "Bangladesh and India",
  },
  {
    englishName: "Vetiver Root",
    banglaName: "Khash",
    phoneticNames: ["Khush"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/Chrysopogon_zizanioides_root.jpg",
    category: "Kebab Spices & Tenderizers",
    region: "Bangladesh and India",
  },
  {
    englishName: "Lentil Wafer (Peppered)",
    banglaName: "Papad",
    phoneticNames: ["Pah-pud"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Papad_raw.jpg",
    category: "Crisp Accompaniments (Papad)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Rice Flour Papad",
    banglaName: "Chaler Papor",
    phoneticNames: ["Chaal-er Pah-por"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/2/22/Rice_Papad.jpg",
    category: "Crisp Accompaniments (Papad)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sago Papad",
    banglaName: "Sabudanar Papor",
    phoneticNames: ["Sa-boo-daa-nar Pah-por"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/e/ec/Sago_Papadum.jpg",
    category: "Crisp Accompaniments (Papad)",
    region: "Bangladesh and India",
  },
  {
    englishName: "Desiccated Coconut",
    banglaName: "Narkel Kora",
    phoneticNames: ["Naar-kayl Ko-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/Grated_coconut.jpg",
    category: "Coastal & Southern Staples",
    region: "Bangladesh and India",
  },
  {
    englishName: "Coconut Milk",
    banglaName: "Narkeler Dudh",
    phoneticNames: ["Naar-kay-layr Doodh"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c1/Coconut_milk_bowl.jpg",
    category: "Coastal & Southern Staples",
    region: "Bangladesh and India",
  },
  {
    englishName: "Kokum (Garcinia)",
    banglaName: "Kokum",
    phoneticNames: ["Ko-koom"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/Garcinia_indica_dried.jpg",
    category: "Coastal & Southern Staples",
    region: "Bangladesh and India",
  },
  {
    englishName: "Grated Jaggery",
    banglaName: "Gurir Kora",
    phoneticNames: ["Goo-reer Ko-rah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/4/4e/Jaggery_powder.jpg",
    category: "Traditional Sweet Fillings",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sesame Seeds (Black)",
    banglaName: "Kalo Til",
    phoneticNames: ["Kaa-lo Teel"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/f/f2/Black_Sesame_Seeds.jpg",
    category: "Traditional Sweet Fillings",
    region: "Bangladesh and India",
  },
  {
    englishName: "Sesame Seeds (White)",
    banglaName: "Sada Til",
    phoneticNames: ["Shaa-daa Teel"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/0/0c/White_sesame_seeds.jpg",
    category: "Traditional Sweet Fillings",
    region: "Bangladesh and India",
  },
  {
    englishName: "Green Mango Powder",
    banglaName: "Amchur",
    phoneticNames: ["Aam-choor"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Amchoor_powder.jpg",
    category: "Village Seasonings",
    region: "Bangladesh and India",
  },
  {
    englishName: "Pomegranate Seeds (Dried)",
    banglaName: "Anardana",
    phoneticNames: ["Aa-naar-daa-nah"],
    imageLink:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Dried_pomegranate_seeds.jpg",
    category: "Village Seasonings",
    region: "Bangladesh and India",
  },
];
