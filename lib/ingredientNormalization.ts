/**
 * Ingredient name normalization to prevent duplicates.
 * Handles plural/singular, common prefixes, and synonym mapping.
 */

// ─── Synonym groups: first entry is canonical ────────────────────────────────
export const FOOD_SYNONYMS: string[][] = [
  ["water", "mineral water", "indian mineral water", "drinking water", "pani"],
  ["salt", "table salt", "sea salt", "rock salt", "lobon", "nun"],
  ["sugar", "white sugar", "granulated sugar", "chini"],
  ["oil", "cooking oil", "vegetable oil", "soybean oil", "tel"],
  ["onion", "red onion", "brown onion", "piaz", "peyaj"],
  ["garlic", "garlic cloves", "garlic clove", "rosun", "roshun"],
  ["ginger", "fresh ginger", "ginger root", "ada"],
  ["turmeric", "turmeric powder", "haldi", "holud"],
  ["cumin", "cumin powder", "cumin seeds", "jeera", "jira"],
  ["chili powder", "red chili powder", "chilli powder", "morich gura", "lal morich gura"],
  ["green chili", "green chilli", "fresh green chili", "kacha morich"],
  ["coriander", "coriander powder", "coriander leaves", "fresh coriander", "dhoniya", "dhonia"],
  ["tomato", "fresh tomato", "tomatoes", "tamato"],
  ["potato", "potatoes", "alu", "aloo"],
  ["rice", "white rice", "basmati rice", "chal", "chaal"],
  ["flour", "all purpose flour", "all-purpose flour", "maida"],
  ["chicken", "chicken pieces", "chicken meat", "murgi"],
  ["egg", "eggs", "dim"],
  ["milk", "fresh milk", "whole milk", "dud", "dudh", "doodh"],
  ["butter", "unsalted butter", "makhan"],
  ["ghee", "clarified butter", "ghee butter"],
  ["yogurt", "yoghurt", "plain yogurt", "curd", "doi", "dahi"],
  ["paneer", "cottage cheese", "ponir", "panir"],
  ["lentil", "lentils", "dal", "daal"],
  ["bay leaf", "bay leaves", "tejpata", "tej pata"],
  ["cardamom", "green cardamom", "cardamom pods", "elach", "elaichi"],
  ["cinnamon", "cinnamon stick", "cinnamon sticks", "dalchini"],
  ["clove", "cloves", "lobongo", "labong"],
  ["mustard oil", "mustard seed oil", "sorisher tel"],
  ["coconut", "coconut flesh", "narkel", "narikel"],
  ["coconut milk", "coconut cream", "narkel er dudh"],
  ["lemon", "lemon juice", "lebu", "lebu ros"],
  ["cilantro", "fresh cilantro", "coriander leaves", "dhoniya pata"],
];

// Build lookup map: any name → canonical name
const synonymLookup = new Map<string, string>();
for (const group of FOOD_SYNONYMS) {
  const canonical = group[0];
  for (const name of group) {
    synonymLookup.set(name.toLowerCase(), canonical);
  }
}

// ─── Prefix stripping ────────────────────────────────────────────────────────
const STRIP_PREFIXES = [
  "fresh ", "dried ", "frozen ", "organic ", "raw ", "cooked ",
  "chopped ", "sliced ", "diced ", "minced ", "crushed ", "ground ",
  "whole ", "powdered ", "roasted ", "toasted ", "fried ",
  "large ", "small ", "medium ", "hot ", "cold ",
  "indian ", "bengali ", "bangladeshi ", "desi ",
];

// ─── Plural → singular rules ────────────────────────────────────────────────
function singularize(word: string): string {
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  if (word.endsWith("ves")) return word.slice(0, -3) + "f";
  if (word.endsWith("ses") || word.endsWith("shes") || word.endsWith("ches") || word.endsWith("xes")) {
    return word.slice(0, -2);
  }
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) return word.slice(0, -1);
  return word;
}

/**
 * Normalize an ingredient name for matching.
 * Returns canonical lowercase form.
 */
export function normalizeIngredientName(name: string): string {
  let n = name.toLowerCase().trim();

  // Remove quantities/numbers at the start like "2 cups of"
  n = n.replace(/^\d+[\s.\/]*(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|grams?|g|kg|ml|oz|lb|pieces?|pcs?)\s*(?:of\s+)?/i, "");

  // Strip prefixes
  for (const prefix of STRIP_PREFIXES) {
    if (n.startsWith(prefix)) {
      n = n.slice(prefix.length);
    }
  }

  // Remove trailing parenthetical like "(optional)" or "(for garnish)"
  n = n.replace(/\s*\(.*?\)\s*$/, "").trim();

  // Singularize
  n = singularize(n);

  // Check synonym lookup
  const canonical = synonymLookup.get(n);
  if (canonical) return canonical;

  return n;
}

/**
 * Get the canonical name for a synonym, or null if not found in synonym groups.
 */
export function getCanonicalName(name: string): string | null {
  return synonymLookup.get(name.toLowerCase().trim()) ?? null;
}

/**
 * Check if two ingredient names are effectively the same.
 */
export function areIngredientsSame(a: string, b: string): boolean {
  return normalizeIngredientName(a) === normalizeIngredientName(b);
}

/**
 * Compute a simple similarity score between two strings (0 to 1).
 * Uses Levenshtein-based approach for short strings.
 */
export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const la = a.length;
  const lb = b.length;
  if (la === 0 || lb === 0) return 0;

  // Simple normalized Levenshtein
  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lb; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const maxLen = Math.max(la, lb);
  return 1 - matrix[la][lb] / maxLen;
}
