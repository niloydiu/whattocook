const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_DIR = path.join(ROOT, "app", "api");
const OUT_FILE = path.join(ROOT, "public", "openapi.json");

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach((dirent) => {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) results.push(...walk(full));
    else results.push(full);
  });
  return results;
}

function routePathFromFile(file) {
  // Expect files like /app/api/recipes/route.ts or /app/api/recipes/[slug]/route.ts
  const rel = path.relative(API_DIR, file);
  const parts = rel.split(path.sep);
  // remove trailing 'route.ts' or 'route.js'
  if (parts[parts.length - 1].startsWith("route.")) parts.pop();
  const urlParts = parts.map((p) =>
    p.startsWith("[") && p.endsWith("]") ? `{${p.slice(1, -1)}}` : p
  );
  return "/api/" + urlParts.join("/");
}

function parseMethods(file) {
  const src = fs.readFileSync(file, "utf8");
  const methods = [];
  const regex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\b/g;
  let m;
  while ((m = regex.exec(src))) methods.push(m[1]);
  return methods;
}

function generate() {
  const files = walk(API_DIR).filter((f) => /route\.(ts|js|tsx|jsx)$/.test(f));

  const paths = {};
  for (const f of files) {
    const methods = parseMethods(f);
    if (methods.length === 0) continue;
    const p = routePathFromFile(f);
    paths[p] = paths[p] || {};
    for (const m of methods) {
      const http = m.toLowerCase();
      paths[p][http] = {
        summary: `Auto-generated operation for ${http.toUpperCase()} ${p}`,
        responses: {
          200: {
            description: "Successful response",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      };
      // path parameter inference
      if (p.includes("{")) {
        const params = [];
        const re = /\{([^}]+)\}/g;
        let mm;
        while ((mm = re.exec(p))) {
          params.push({
            name: mm[1],
            in: "path",
            required: true,
            schema: { type: "string" },
          });
        }
        if (params.length) paths[p][http].parameters = params;
      }
    }
  }

  const openapi = {
    openapi: "3.0.3",
    info: {
      title: "whattocook API (auto-generated)",
      version: "1.0.0",
      description:
        "Auto-generated OpenAPI spec. Run `npm run openapi:generate` to refresh.",
    },
    servers: [{ url: "http://localhost:3000" }],
    paths,
  };

  // ensure public exists
  const outDir = path.dirname(OUT_FILE);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(openapi, null, 2));
  console.log("Wrote", OUT_FILE);
}

if (require.main === module) generate();

module.exports = { generate };
