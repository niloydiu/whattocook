# Improved Gemini Prompt for Recipe Extraction (v2)

Copy and paste the following prompt into Google Gemini (Pro/Flash) along with a YouTube video transcript or just the video link if you are using Gemini via Google AI Studio or a tool that can fetch YouTube content.

---

## The Prompt

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
  "newIngredients": []
}
```

**Video Link/Transcript:** [INSERT YOUTUBE LINK HERE OR PASTE TRANSCRIPT BELOW]
