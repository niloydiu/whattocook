#!/usr/bin/env node
const fs = require("fs/promises");
const path = require("path");
const { pipeline } = require("stream/promises");

const ROOT = process.cwd();
const MISSING = path.join(ROOT, "scripts", "missing_images.json");
const ING = path.join(ROOT, "lib", "ingredients.json");
const OUT_REPORT = path.join(ROOT, "scripts", "search_image_fix_report.json");
const PUBLIC_DIR = path.join(ROOT, "public", "ingredients");

const CONCURRENCY = 6;
const TIMEOUT_MS = 15000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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

async function ensureDir(d) {
  try {
    await fs.mkdir(d, { recursive: true });
  } catch (e) {}
}

function finalFilename(suggested) {
  return suggested.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
}

async function getWikipediaImage(name) {
  const q = encodeURIComponent(name);
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${q}&prop=pageimages&pithumbsize=640`;
  const res = await timeoutFetch(url, {
    method: "GET",
    headers: { "User-Agent": "whattocook-image-fixer/1.0" },
  });
  if (!res || !res.ok) return null;
  const body = await res.json();
  if (!body.query || !body.query.pages) return null;
  const pages = Object.values(body.query.pages);
  if (!pages || pages.length === 0) return null;
  const page = pages[0];
  if (page && page.thumbnail && page.thumbnail.source)
    return page.thumbnail.source;
  return null;
}

async function getUnsplashSource(name) {
  const q = encodeURIComponent(name);
  // Use Unsplash Source to get a reasonably relevant image without API key
  const src = `https://source.unsplash.com/640x640/?${q}`;
  // Follow redirect to get final URL
  const res = await timeoutFetch(src, { method: "GET" });
  if (!res) return null;
  // If final URL is a redirect, fetch returned final resource; use its url
  return res.url || null;
}

async function downloadToFile(url, filepath) {
  const res = await timeoutFetch(url, { method: "GET" });
  if (!res || !res.ok) return false;
  const dest = await fs.open(filepath, "w");
  try {
    await pipeline(res.body, dest.createWriteStream());
    await dest.close();
    return true;
  } catch (e) {
    try {
      await dest.close();
    } catch (e) {}
    return false;
  }
}

async function main() {
  const argLimit = process.argv.find((a) => a.startsWith("--limit="));
  const limit = argLimit ? parseInt(argLimit.split("=")[1], 10) : 50;
  console.log(`Starting search-and-fix (limit=${limit})`);

  const raw = await fs.readFile(MISSING, "utf8");
  const missing = JSON.parse(raw);
  const ingRaw = await fs.readFile(ING, "utf8");
  const ingredients = JSON.parse(ingRaw);

  await ensureDir(PUBLIC_DIR);

  const report = { attempted: 0, saved: [], failed: [] };

  const queue = missing.slice(0, limit);

  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      report.attempted++;
      const fname = finalFilename(item.suggested_filename);
      const outPath = path.join(PUBLIC_DIR, fname);

      // Try Wikipedia image
      let src = await getWikipediaImage(item.name_en).catch(() => null);
      if (!src) {
        // fallback to Unsplash Source
        src = await getUnsplashSource(item.name_en).catch(() => null);
      }

      if (!src) {
        report.failed.push({ id: item.id, name_en: item.name_en });
        continue;
      }

      // Download and save
      const ok = await downloadToFile(src, outPath);
      if (!ok) {
        report.failed.push({ id: item.id, name_en: item.name_en, source: src });
        continue;
      }

      // Update ingredients.json entry
      const idx = ingredients.findIndex(
        (i) => String(i.id) === String(item.id)
      );
      if (idx !== -1) {
        ingredients[idx].img = `/ingredients/${fname}`;
      }

      report.saved.push({
        id: item.id,
        name_en: item.name_en,
        file: `/ingredients/${fname}`,
        source: src,
      });
      // small delay to be polite
      await sleep(200);
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
  await Promise.all(workers);

  // Write updated ingredients.json and report
  await fs.writeFile(ING, JSON.stringify(ingredients, null, 2), "utf8");
  await fs.writeFile(OUT_REPORT, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `Done. attempted=${report.attempted} saved=${report.saved.length} failed=${report.failed.length}`
  );
  console.log(`Report: ${OUT_REPORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
