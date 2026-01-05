import prisma from "../lib/prisma";
import {
  generatePhoneticVariations,
  normalizePhonetic,
} from "../lib/phoneticUtils";

type Fish = {
  name_en: string;
  name_bn: string;
  img?: string;
  phonetic?: string[];
};

const fishList: Fish[] = [
  { name_en: "Rohu", name_bn: "রুই", img: "" },
  { name_en: "Hilsa", name_bn: "ইলিশ", img: "" },
  { name_en: "Catla", name_bn: "কাতলা", img: "" },
  { name_en: "Pabda", name_bn: "পাবদা", img: "" },
  { name_en: "Koi", name_bn: "কৈ", img: "" },
  { name_en: "Magur", name_bn: "মাগুর", img: "" },
  { name_en: "Pangasius", name_bn: "পাঙ্গাস", img: "" },
  { name_en: "Tilapia", name_bn: "টিলাপিয়া", img: "" },
  { name_en: "Bhetki (Barramundi)", name_bn: "বেতকি", img: "" },
  { name_en: "Pabda", name_bn: "পাবদা", img: "" },
  { name_en: "Surmai (Kingfish)", name_bn: "সুরমাই", img: "" },
  { name_en: "Pomfret", name_bn: "পমফ্রেট", img: "" },
  { name_en: "Mackerel", name_bn: "ম্যাকারেল", img: "" },
  { name_en: "Sardine", name_bn: "সার্ডিন", img: "" },
  { name_en: "Tuna", name_bn: "টুনা", img: "" },
  { name_en: "Salmon", name_bn: "স্যামন", img: "" },
  { name_en: "Trout", name_bn: "ট্রাউট", img: "" },
  { name_en: "Carp", name_bn: "কার্প", img: "" },
  { name_en: "Anchovy", name_bn: "অ্যাঙ্কোভি", img: "" },
  { name_en: "Grouper", name_bn: "গ্রুপার", img: "" },
  { name_en: "Seer Fish", name_bn: "সুরমাই", img: "" },
  { name_en: "King Mackerel", name_bn: "কিং ম্যাকারেল", img: "" },
  { name_en: "Swordfish", name_bn: "সোর্ডফিশ", img: "" },
  { name_en: "Halibut", name_bn: "হ্যালিবাট", img: "" },
  { name_en: "Snapper", name_bn: "স্ন্যাপার", img: "" },
  { name_en: "Barramundi", name_bn: "ব্যারামুঙ্গি", img: "" },
  { name_en: "Herring", name_bn: "হ্যারিং", img: "" },
  { name_en: "Red Snapper", name_bn: "রেড স্ন্যাপার", img: "" },
  { name_en: "Butterfish", name_bn: "বাটারফিশ", img: "" },
];

async function upsertFishList() {
  const created: string[] = [];
  const updated: string[] = [];

  for (const fish of fishList) {
    // Normalize phonetic suggestions
    const phoneticArray = fish.phonetic && fish.phonetic.length > 0
      ? fish.phonetic.map((p) => normalizePhonetic(p))
      : generatePhoneticVariations(fish.name_en || "");

    // Try to find existing ingredient by english (insensitive) or bangla exact
    const existing = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { name_en: { equals: fish.name_en, mode: "insensitive" } },
          { name_bn: { equals: fish.name_bn } },
        ],
      },
    });

    if (existing) {
      // Merge phonetic arrays without duplicates
      const existingPh = existing.phonetic || [];
      const mergedPh = Array.from(new Set([...existingPh, ...phoneticArray]));

      // Update image if missing
      const img = existing.img && existing.img.length > 0 ? existing.img : (fish.img || "");

      await prisma.ingredient.update({
        where: { id: existing.id },
        data: {
          img,
          phonetic: mergedPh,
          updatedAt: new Date(),
        },
      });

      updated.push(`${fish.name_en} (id: ${existing.id})`);
    } else {
      const createdRec = await prisma.ingredient.create({
        data: {
          name_en: fish.name_en,
          name_bn: fish.name_bn || "",
          img: fish.img || "",
          phonetic: phoneticArray,
        },
      });
      created.push(`${fish.name_en} (id: ${createdRec.id})`);
    }
  }

  console.log(`Created: ${created.length}`, created.slice(0, 50));
  console.log(`Updated: ${updated.length}`, updated.slice(0, 50));

  await prisma.$disconnect();
}

upsertFishList()
  .then(() => console.log("Done inserting fish ingredients."))
  .catch((err) => {
    console.error("Error inserting fish ingredients:", err);
    process.exit(1);
  });
