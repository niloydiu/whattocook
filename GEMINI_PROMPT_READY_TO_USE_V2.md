
**Task:** Act as an expert culinary data scientist and translator. Extract a complete, high-quality recipe from the provided YouTube video/transcript into the EXACT JSON format specified below.

**Instructions:**
1.  **Translation:** Provide both English (`_en`) and Bengali (`_bn`) translations for all text fields. Ensure the Bengali translation is natural and uses standard culinary terms.
2.  **Measurements:** Convert measurements to standard metric/imperial units as used in the video.
3.  **Timestamps:** Provide accurate MM:SS timestamps for each major step in the video.
4.  **Blog Content:** Write engaging, SEO-friendly descriptions for the blog sections.
    *   `intro`: Brief exciting introduction to the dish.
    *   `what_makes_it_special`: Mention unique techniques or ingredients.
    *   `cooking_tips`: Professional advice to avoid common mistakes.
    *   `serving`: Best pairings (e.g., "Serve with hot paratha").
    *   `storage`: How to store and reheat.
    *   `full_blog`: A comprehensive 300-500 word blog post combining all the above in a narrative style.
5.  **Categories:**
    *   `cuisine`: e.g., "Indian", "Chinese", "Italian", "Bengali".
    *   `category`: e.g., "Main Course", "Snack", "Dessert", "Breakfast".
    *   `foodCategory`: MUST be one of: "Savory", "Sweet", "Spicy", "Sour".
    *   `difficulty`: "Easy", "Medium", or "Hard".
6.  **Ingredients Logic:**
    *   Internal ingredients should match our standard naming (e.g., "Onion", "Garlic", "Chicken").
    *   If the video uses an ingredient NOT commonly found in a basic pantry, list it in English/Bengali properly.
  *   You will be provided (separately) a list of known ingredients. Use the exact `name_en`/`name_bn` when there's an exact match. For any ingredient you cannot match, include it in the `newIngredients` array (see schema below) with a suggested canonical `name_en` and `name_bn`.

**JSON Schema to follow:**

```json
{
  "slug": "url-friendly-slug-in-english",
  "title_en": "Recipe Title in English",
  "title_bn": "রেসিপির নাম বাংলায়",
  "image": "https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg",
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "youtube_id": "VIDEO_ID",
  "cuisine": "Cuisine Name",
  "category": "Course Category",
  "foodCategory": "Savory/Sweet/Spicy/Sour",
  "difficulty": "Easy/Medium/Hard",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "ingredients": [
    {
      "name_en": "Ingredient Name",
      "name_bn": "উপকরণের নাম",
      "quantity": "2",
      "unit_en": "cups/tbsp/pcs",
      "unit_bn": "কাপ/চামচ/টি",
      "notes_en": "finely chopped",
      "notes_bn": "মিহি কুচি"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "instruction_en": "Step instruction in English.",
      "instruction_bn": "ধাপের বর্ণনা বাংলায়।",
      "timestamp": "0:45"
    }
  ],
  "blogContent": {
    "intro_en": "Intro text...",
    "intro_bn": "ভূমিকা...",
    "what_makes_it_special_en": "Text...",
    "what_makes_it_special_bn": "বিশেষত্ব...",
    "cooking_tips_en": "Tips...",
    "cooking_tips_bn": "পরামর্শ...",
    "serving_en": "Serving text...",
    "serving_bn": "পরিবেশন...",
    "storage_en": "Storage text...",
    "storage_bn": "সংরক্ষণ...",
    "full_blog_en": "Full detailed blog post in English...",
    "full_blog_bn": "বিস্তারিত ব্লগ পোস্ট বাংলায়..."
  },
  "newIngredients": [
    {
      "name_en": "Canonical English name",
      "name_bn": "বানান বাংলায়",
      "notes_en": "Optional note about why this is new or normalization choices",
      "notes_bn": "বাংলা নোট"
    }
  ]
}
```

**Video Link/Transcript:** [INSERT YOUTUBE LINK HERE OR PASTE TRANSCRIPT BELOW]

Additional rules:
- Return ONLY valid JSON with UTF-8 characters, no surrounding markdown or commentary.
- Use `foodCategory` strictly from: "Savory", "Sweet", "Spicy", "Sour". If the recipe fits multiple, choose the dominant category.
- For `category` choose the most specific course (e.g., "Dessert", "Main Course", "Snack", "Breakfast").
- Normalize ingredient names to singular, title-case English (e.g., "Onion", not "onions"), and provide natural Bangla translations.

IMPORTANT URL RULES:

- DO NOT output markdown-style links (e.g. `[label](url)`) anywhere. Return raw URL strings only.
- The `image` and `youtube_url` fields MUST contain plain URL text (for example: `https://img.youtube.com/vi/aMa8TacRlkU/maxresdefault.jpg` and `https://www.youtube.com/watch?v=aMa8TacRlkU`).
- If you receive a wrapped markdown link, unwrap it and output only the URL.
- Example (correct):
  - `"image": "https://img.youtube.com/vi/aMa8TacRlkU/maxresdefault.jpg"`
  - `"youtube_url": "https://www.youtube.com/watch?v=aMa8TacRlkU"`
  
Example (incorrect):
  - `"image": "[https://img.youtube.com/vi/aMa8TacRlkU/maxresdefault.jpg](https://www.google.com/...)"`  <-- DO NOT USE

YouTube & Image validation (REQUIRED):

- Always extract the `youtube_id` from the provided YouTube link if a link is given. The canonical YouTube video id MUST match the regex: `^[A-Za-z0-9_-]{11}$`.
- `youtube_url` must be the exact canonical form: `https://www.youtube.com/watch?v=VIDEO_ID` (replace `VIDEO_ID` with the validated id). Do NOT return shortened or embed URLs.
- `image` MUST be a YouTube thumbnail for that `youtube_id` using this exact template: `https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg`. Replace `VIDEO_ID` with the validated id.
- Always construct the thumbnail URL from the validated video id. Do NOT copy-paste a search-result or wrapped markdown link. Use this primary thumbnail template:

  - `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg` (preferred, highest quality)

  Optional alternative thumbnails (only provide these as an `thumbnailAlternatives` array if available):

  - `https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg`
  - `https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg`
  - `https://img.youtube.com/vi/VIDEO_ID/sddefault.jpg`
  - `https://img.youtube.com/vi/VIDEO_ID/0.jpg` (frame 0), `1.jpg`, `2.jpg`, `3.jpg`

  Example: if `youtube_id` is `bHgrc4VebTk`, set `image` to `https://img.youtube.com/vi/bHgrc4VebTk/maxresdefault.jpg`.
- If you cannot determine a valid 11-character `youtube_id` from the transcript/link, set `youtube_id` and `youtube_url` to empty string (`""`) and add a short note in `newIngredients` or include a top-level `validation` object (see below) explaining why. Prefer returning an empty string rather than inventing or guessing IDs.
- If the video has no thumbnail at `maxresdefault.jpg`, still return the `image` URL using the template above (the importer will attempt to fetch it). Do not invent alternate hosts.
 - If the video has no thumbnail at `maxresdefault.jpg`, still return the `image` URL using the template above (the importer will attempt to fetch it). Do not invent alternate hosts or return search/preview links. If no reliable id can be found, return empty strings for `youtube_id` and `youtube_url` and include a short `validation` note explaining why.

Validation output (optional but recommended): include a `validation` object in the top-level JSON with keys `youtube_id_valid` (true/false), `youtube_url_valid` (true/false), and `image_url_valid_format` (true/false). For example:

```json
"validation": {
  "youtube_id_valid": true,
  "youtube_url_valid": true,
  "image_url_valid_format": true
}
```

This helps downstream importers decide whether manual review is required.

make sure image link, yt url link are valid.