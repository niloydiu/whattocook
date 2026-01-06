import prisma from "./prisma";

export async function findOrCreateIngredient(data: {
  name_en?: string;
  name_bn?: string;
  img?: string;
  phonetic?: string[];
}) {
  const nameEn = data.name_en ? String(data.name_en).trim() : undefined;
  const nameBn = data.name_bn ? String(data.name_bn).trim() : undefined;

  // Try to find by exact english name (case-insensitive) or bangla name
  const found = await prisma.ingredient.findFirst({
    where: {
      OR: [
        nameEn ? { name_en: { equals: nameEn, mode: "insensitive" } } : undefined,
        nameBn ? { name_bn: nameBn } : undefined,
      ].filter(Boolean) as any,
    },
  });

  if (found) return found;

  // Create new ingredient
  const created = await prisma.ingredient.create({
    data: {
      name_en: nameEn ?? "",
      name_bn: nameBn ?? "",
      img: data.img ?? "",
      phonetic: data.phonetic ?? [],
    },
  });

  return created;
}

export default findOrCreateIngredient;
