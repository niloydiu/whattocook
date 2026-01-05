const fs = require("fs/promises");
const path = require("path");

const ROOT = process.cwd();
const REPORT = path.join(ROOT, "scripts", "image_report.json");
const OUT = path.join(ROOT, "scripts", "missing_images.json");

async function main() {
  const raw = await fs.readFile(REPORT, "utf8");
  const report = JSON.parse(raw);
  const broken = report.broken || [];

  const out = broken.map((b) => ({
    id: b.id,
    name_en: b.name_en,
    // suggested filename for upload
    suggested_filename: `${b.id}-${b.name_en.replace(/\s+/g, "_")}.png`,
    // current failing URL (for reference)
    from: b.from || null,
  }));

  await fs.writeFile(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${out.length} entries to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
