#!/usr/bin/env node
const fs = require("fs/promises");
const path = require("path");

const ROOT = process.cwd();
const INGREDIENTS_PATH = path.join(ROOT, "lib", "ingredients.json");
const REPORT_PATH = path.join(ROOT, "scripts", "image_report.json");
const BACKUP_PATH = path.join(ROOT, "lib", "ingredients.backup.json");

const CONCURRENCY = 12;
const TIMEOUT_MS = 8000;

async function timeoutFetch(url, opts = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      ...opts,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    return null;
  }
}

async function checkUrl(url) {
  if (!url) return false;
  try {
    // Try HEAD first
    let res = await timeoutFetch(url, { method: "HEAD" });
    if (res && res.ok) return true;
    // Some servers block HEAD; try GET with range to reduce bandwidth
    res = await timeoutFetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-1023" },
    });
    if (res && res.ok) return true;
    return false;
  } catch (e) {
    return false;
  }
}

function formatMealDbName(name) {
  if (!name) return "";
  // Capitalize each word, remove extra spaces
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("%20");
}

async function main() {
  console.log("🔎 Reading ingredients...");
  const raw = await fs.readFile(INGREDIENTS_PATH, "utf8");
  const ingredients = JSON.parse(raw);

  // Backup original
  await fs.writeFile(BACKUP_PATH, raw, "utf8");
  console.log(`📦 Backup written to ${BACKUP_PATH}`);

  const report = {
    total: ingredients.length,
    checked: 0,
    fixed: [],
    broken: [],
  };

  // Process in limited concurrency
  const queue = [...ingredients.keys()];

  async function worker() {
    while (queue.length) {
      const idx = queue.shift();
      const ing = ingredients[idx];
      report.checked++;
      const original = ing.img || null;

      let ok = false;
      if (original) {
        ok = await checkUrl(original);
      }

      if (ok) {
        if (report.checked % 100 === 0)
          console.log(`✅ ${report.checked}/${report.total} OK`);
        continue;
      }

      // Try generated TheMealDB URL
      const candidate = `https://www.themealdb.com/images/ingredients/${formatMealDbName(
        ing.name_en
      )}.png`;
      const candOk = await checkUrl(candidate);
      if (candOk) {
        ing.img = candidate;
        report.fixed.push({
          id: ing.id,
          name_en: ing.name_en,
          from: original,
          to: candidate,
        });
        if (report.fixed.length % 50 === 0)
          console.log(`🔧 Fixed ${report.fixed.length} so far`);
        continue;
      }

      // Try encoded variant (spaces encoded normally)
      const candidate2 = `https://www.themealdb.com/images/ingredients/${encodeURIComponent(
        ing.name_en
      )}.png`;
      const cand2Ok = await checkUrl(candidate2);
      if (cand2Ok) {
        ing.img = candidate2;
        report.fixed.push({
          id: ing.id,
          name_en: ing.name_en,
          from: original,
          to: candidate2,
        });
        continue;
      }

      // Not fixed — null out or leave null
      ing.img = null;
      report.broken.push({ id: ing.id, name_en: ing.name_en, from: original });
    }
  }

  // Launch workers
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
  await Promise.all(workers);

  // Write report and updated ingredients
  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  await fs.writeFile(
    INGREDIENTS_PATH,
    JSON.stringify(ingredients, null, 2),
    "utf8"
  );

  console.log(
    `✅ Done. Checked ${report.checked}. Fixed: ${report.fixed.length}. Broken: ${report.broken.length}`
  );
  console.log(`📝 Report saved to ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error("Fatal error", err);
  process.exit(1);
});
