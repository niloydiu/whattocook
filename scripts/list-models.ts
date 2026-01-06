import * as dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

async function main() {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.error("GEMINI_API_KEY is not set in environment");
      process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
    console.log("Requesting:", url);
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("Response text:", text);
    }
  } catch (e) {
    console.error("Error listing models:", e);
    process.exit(1);
  }
}

main();
