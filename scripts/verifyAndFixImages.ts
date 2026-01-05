import prisma from "../lib/prisma";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=600&q=80";
const UNSPLASH_SEARCH = "https://source.unsplash.com/featured/600x400/?";

async function verifyUrl(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!res.ok) {
      return `status ${res.status}`;
    }
    return null;
  } catch (error) {
    return (error as Error).message;
  }
}

async function getReplacementImage(name: string) {
  const fallbackName = name || "ingredient";
  const searchUrl = `${UNSPLASH_SEARCH}${encodeURIComponent(fallbackName)}`;
  const res = await fetch(searchUrl, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Unsplash search failed with status ${res.status}`);
  }
  return res.url;
}

async function run() {
  const broken: Array<{ id: number; name: string; img: string; reason: string }> = [];
  const ingredients = await prisma.ingredient.findMany({
    select: { id: true, name_en: true, name_bn: true, img: true },
  });

  for (const ingredient of ingredients) {
    const url = ingredient.img?.trim() ?? "";
    let reason: string | null = null;
    if (!url) {
      reason = "missing image";
    } else if (url === FALLBACK_IMAGE) {
      reason = "fallback image";
    } else {
      reason = await verifyUrl(url);
    }

    if (reason) {
      broken.push({
        id: ingredient.id,
        name: ingredient.name_en,
        img: url,
        reason,
      });
      try {
        const replacement = await getReplacementImage(
          ingredient.name_en || ingredient.name_bn || "ingredient"
        );
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: { img: replacement, updatedAt: new Date() },
        });
      } catch (replacementError) {
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: { img: FALLBACK_IMAGE, updatedAt: new Date() },
        });
      }
    }
  }

  if (broken.length) {
    console.log("Updated", broken.length, "ingredients with a fallback image. Details:");
    for (const row of broken) {
      console.log(`- ${row.name} (id ${row.id}): ${row.reason} -> ${row.img || FALLBACK_IMAGE}`);
    }
  } else {
    console.log("All ingredient images valid.");
  }

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
