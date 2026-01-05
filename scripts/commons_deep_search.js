#!/usr/bin/env node
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);

const PUBLIC_DIR = path.join(__dirname, "..", "public", "ingredients");
const LIB_PATH = path.join(__dirname, "..", "lib", "ingredients.json");
const REPORT_PATH = path.join(__dirname, "commons_deep_report.json");

function sanitizeFilename(s) {
  return s.replace(/[^a-z0-9.-]+/gi, "_").replace(/_+/g, "_");
}

async function ensureDir() {
  await fsp.mkdir(PUBLIC_DIR, { recursive: true });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { limit: 200, perQueryLimit: 1 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--limit="))
      opts.limit = Number(a.split("=")[1]) || opts.limit;
  }
  return opts;
}

async function commonsSearch(query, limit = 1) {
  const api = "https://commons.wikimedia.org/w/api.php";
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrlimit: String(limit),
    gsrnamespace: "6", // File namespace
    prop: "imageinfo",
    iiprop: "url",
    origin: "*",
  });
  const url = `${api}?${params.toString()}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "whattocook/commons-deep-search (contact: niloy@example.com)",
      },
    });
    const json = await res.json();
    if (!json.query || !json.query.pages) return [];
    const pages = Object.values(json.query.pages);
    const results = [];
    for (const p of pages) {
      if (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url) {
        results.push({ title: p.title, url: p.imageinfo[0].url });
      }
    }
    return results;
  } catch (err) {
    return [];
  }
}

async function downloadToFile(url, dest) {
  const maxAttempts = 4;
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "whattocook/commons-deep-search (contact: niloy@example.com)",
      },
    });
    if (res.status === 429) {
      const wait = 1000 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`Failed ${res.status}`);
    await streamPipeline(res.body, fs.createWriteStream(dest));
    return;
  }
  throw new Error("Too many 429 responses");
}

async function main() {
  const opts = parseArgs();
  await ensureDir();
  const raw = await fsp.readFile(LIB_PATH, "utf8");
  const ingredients = JSON.parse(raw);
  const candidates = ingredients.filter((i) => i.img && i.img.endsWith(".svg"));
  console.log(
    `Found ${candidates.length} svg placeholders; processing up to ${opts.limit}`
  );
  const toProcess = candidates.slice(0, opts.limit);
  const report = {
    total: toProcess.length,
    replaced: 0,
    skipped: 0,
    failures: [],
  };

  for (const ing of toProcess) {
    const queries = [];
    if (ing.name_en) queries.push(ing.name_en);
    if (ing.name_bn) queries.push(ing.name_bn);
    if (ing.phonetic && Array.isArray(ing.phonetic))
      queries.push(...ing.phonetic.slice(0, 3));
    if (ing.romanizedBangla) queries.push(ing.romanizedBangla);
    // add variants
    queries.push(
      `${ing.name_en} ingredient`,
      `${ing.name_en} food`,
      `${ing.name_en} vegetable`
    );

    let found = false;
    for (const q of queries) {
      if (!q) continue;
      // be kind to the API
      await new Promise((r) => setTimeout(r, 1000));
      const results = await commonsSearch(q, opts.perQueryLimit);
      if (results.length === 0) continue;
      const fileUrl = results[0].url;
      try {
        const ext =
          path.extname(new URL(fileUrl).pathname).split("?")[0] || ".jpg";
        const filename = sanitizeFilename(
          `${ing.id}_${ing.name_en}${ext}`
        ).toLowerCase();
        const dest = path.join(PUBLIC_DIR, filename);
        await downloadToFile(fileUrl, dest);
        // update ingredient
        ing.img = `/ingredients/${filename}`;
        report.replaced++;
        console.log(`Replaced ${ing.id} -> ${filename}`);
        found = true;
        break;
      } catch (err) {
        // try next result/query
        console.error(`Failed download for ${ing.id} ${q}: ${err.message}`);
      }
    }
    if (!found) {
      report.failures.push({ id: ing.id, name_en: ing.name_en });
      report.skipped++;
    }
  }

  // write back lib
  await fsp.writeFile(LIB_PATH, JSON.stringify(ingredients, null, 2), "utf8");
  await fsp.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log("Done.", report);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
