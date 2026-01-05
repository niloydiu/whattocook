#!/usr/bin/env node
const fs = require("fs/promises");
const path = require("path");

const ROOT = process.cwd();
const REPORT = path.join(ROOT, "scripts", "search_image_fix_report.json");
const ING = path.join(ROOT, "lib", "ingredients.json");
const OUT_REPORT = path.join(ROOT, "scripts", "commons_fix_report.json");
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

async function commonsSearchImage(name) {
  const q = encodeURIComponent(name + " site:commons.wikimedia.org");
  // Use Wikimedia API to search file namespace
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
    name
  )}&srnamespace=6&srlimit=3`;
  const res = await timeoutFetch(searchUrl, {
    method: "GET",
    headers: { "User-Agent": "whattocook-commons-fixer/1.0" },
  });
  if (!res || !res.ok) return null;
  const body = await res.json();
  if (!body.query || !body.query.search || body.query.search.length === 0)
    return null;
  // Try first matches to get image info
  for (const s of body.query.search) {
    const title = encodeURIComponent(s.title);
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${title}&prop=imageinfo&iiprop=url`;
    const infoRes = await timeoutFetch(infoUrl, {
      method: "GET",
      headers: { "User-Agent": "whattocook-commons-fixer/1.0" },
    });
    if (!infoRes || !infoRes.ok) continue;
    const infoBody = await infoRes.json();
    if (!infoBody.query || !infoBody.query.pages) continue;
    const pages = Object.values(infoBody.query.pages);
    if (!pages || pages.length === 0) continue;
    const page = pages[0];
    if (page && page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url)
      return page.imageinfo[0].url;
  }
  return null;
}

async function downloadToFile(url, filepath) {
  const res = await timeoutFetch(url, { method: "GET" });
  if (!res || !res.ok) return false;
  const data = await res.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(data));
  return true;
}

function makeSvg(name) {
  const safe = name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">\n  <rect width="100%" height="100%" fill="#f8fafc"/>\n  <rect x="20" y="20" width="472" height="472" rx="28" fill="#fff" stroke="#e6edf3"/>\n  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="28" fill="#334155">${safe}</text>\n</svg>`;
}

async function main() {
  console.log("Starting Wikimedia Commons search + SVG fallback");
  const raw = await fs.readFile(REPORT, "utf8");
  const report = JSON.parse(raw);
  const failedList = report.failed || [];
  if (failedList.length === 0) {
    console.log("No failed items to process");
    return;
  }

  const ingRaw = await fs.readFile(ING, "utf8");
  const ingredients = JSON.parse(ingRaw);
  await ensureDir(PUBLIC_DIR);

  const out = { attempted: 0, downloaded: [], svgs: [], still_failed: [] };

  const queue = failedList.slice();

  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      out.attempted++;
      const base = finalFilename(
        `${item.id}-${item.name_en.replace(/\s+/g, "_")}`
      );
      const fname = `${base}.png`;
      const outPath = path.join(PUBLIC_DIR, fname);

      // Try commons search
      const src = await commonsSearchImage(item.name_en).catch(() => null);
      if (src) {
        const ok = await downloadToFile(src, outPath).catch(() => false);
        if (ok) {
          const idx = ingredients.findIndex(
            (i) => String(i.id) === String(item.id)
          );
          if (idx !== -1) ingredients[idx].img = `/ingredients/${fname}`;
          out.downloaded.push({
            id: item.id,
            name_en: item.name_en,
            source: src,
            file: `/ingredients/${fname}`,
          });
          await sleep(200);
          continue;
        }
      }

      // Create SVG fallback
      const svgName = `${base}.svg`;
      const svgPath = path.join(PUBLIC_DIR, svgName);
      const svgContent = makeSvg(item.name_en);
      await fs.writeFile(svgPath, svgContent, "utf8");
      const idx = ingredients.findIndex(
        (i) => String(i.id) === String(item.id)
      );
      if (idx !== -1) ingredients[idx].img = `/ingredients/${svgName}`;
      out.svgs.push({
        id: item.id,
        name_en: item.name_en,
        file: `/ingredients/${svgName}`,
      });
      await sleep(100);
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
  await Promise.all(workers);

  // Write back
  await fs.writeFile(ING, JSON.stringify(ingredients, null, 2), "utf8");
  await fs.writeFile(OUT_REPORT, JSON.stringify(out, null, 2), "utf8");

  console.log(
    `Done. attempted=${out.attempted} downloaded=${out.downloaded.length} svgs=${out.svgs.length}`
  );
  console.log(`Report: ${OUT_REPORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
