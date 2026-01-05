import prisma from "../lib/prisma";

const names = [
  "Rohu",
  "Hilsa",
  "Catla",
  "Pabda",
  "Koi",
  "Magur",
  "Pangasius",
  "Tilapia",
  "Bhetki (Barramundi)",
  "Surmai (Kingfish)",
  "Pomfret",
  "Mackerel",
  "Sardine",
  "Tuna",
  "Salmon",
  "Trout",
  "Carp",
  "Anchovy",
  "Grouper",
  "Seer Fish",
  "King Mackerel",
  "Swordfish",
  "Halibut",
  "Snapper",
  "Barramundi",
  "Herring",
  "Red Snapper",
  "Butterfish",
];

async function run() {
  for (const n of names) {
    const base = n.split(" ")[0];
    const rows = await prisma.ingredient.findMany({
      where: { name_en: { contains: base, mode: "insensitive" } },
    });
    console.log(`${n}: ${rows.length}`);
    for (const r of rows) {
      console.log("  -", r.name_en, "|", r.name_bn, "| id=", r.id);
    }
  }
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
