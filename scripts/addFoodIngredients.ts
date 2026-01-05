import prisma from "../lib/prisma";
import { foodCatalog } from "./foodCatalog";
import { normalizePhonetic } from "../lib/phoneticUtils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=600&q=80";

function normalizePhonetics(names: string[]): string[] {
  const normalized = new Set<string>();
  for (const name of names) {
    const phonetic = normalizePhonetic(name);
    if (phonetic) {
      normalized.add(phonetic);
    }
  }
  return Array.from(normalized);
}

async function upsertFoodCatalog() {
  const created: string[] = [];
  const updated: string[] = [];

  for (const entry of foodCatalog) {
    const phonetics = normalizePhonetics(entry.phoneticNames);
    const image = entry.imageLink || FALLBACK_IMAGE;

    const existing = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { name_en: { equals: entry.englishName, mode: "insensitive" } },
          { name_bn: { equals: entry.banglaName } },
        ],
      },
    });

    if (existing) {
      const mergedPh = Array.from(
        new Set([...existing.phonetic, ...phonetics])
      );
      const nextImage = image || existing.img || FALLBACK_IMAGE;
      await prisma.ingredient.update({
        where: { id: existing.id },
        data: {
          img: nextImage,
          phonetic: mergedPh,
          updatedAt: new Date(),
        },
      });
      updated.push(`${entry.englishName} (id: ${existing.id})`);
    } else {
      const imgUrl = entry.imageLink || FALLBACK_IMAGE;
      const createdRecord = await prisma.ingredient.create({
        data: {
          name_en: entry.englishName,
          name_bn: entry.banglaName,
          img: imgUrl,
          phonetic: phonetics,
        },
      });
      created.push(`${entry.englishName} (id: ${createdRecord.id})`);
    }
  }

  console.log(`Created: ${created.length}`, created.slice(0, 20));
  console.log(`Updated: ${updated.length}`, updated.slice(0, 20));
  await prisma.$disconnect();
}

upsertFoodCatalog()
  .then(() => console.log("Food catalog upsert complete."))
  .catch((err) => {
    console.error("Failed to upsert food catalog:", err);
    process.exit(1);
  });
