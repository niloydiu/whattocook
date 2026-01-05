/**
 * Phonetic normalization utility for Bangla-English transliteration
 * Handles common spelling variations in phonetic Bangla
 */

// Common phonetic mappings for Bangla words in English
const phoneticMap: Record<string, string[]> = {
  // Vowels
  a: ["a", "aa", "aah"],
  e: ["e", "ae", "ay"],
  i: ["i", "ee", "ii"],
  o: ["o", "oo", "oh"],
  u: ["u", "oo", "uu"],

  // Consonants with variations
  k: ["k", "c", "q"],
  g: ["g", "gh"],
  j: ["j", "z"],
  t: ["t", "th"],
  d: ["d", "dh"],
  b: ["b", "bh"],
  p: ["p", "ph", "f"],
  s: ["s", "sh", "c"],
  r: ["r", "rh"],
  l: ["l", "lh"],
  n: ["n", "nh"],
  m: ["m", "mh"],
};

/**
 * Common Bangla food ingredient phonetic variations
 * Maps various spellings to a normalized form
 */
export const commonPhoneticVariations: Record<string, string[]> = {
  // Vegetables
  alu: ["alu", "aloo", "aalu", "aaloo"],
  piaz: ["piaz", "piyaz", "peaj", "peyaj", "piyaj"],
  begun: ["begun", "bagun", "baegun", "begoon"],
  morich: ["morich", "morish", "marich", "marish"],
  rosun: ["rosun", "roshun", "rasun", "rashun"],
  ada: ["ada", "aadaa", "adaa"],
  lau: ["lau", "laau", "lao"],
  kumra: ["kumra", "kumro", "kumraa"],
  shak: ["shak", "shaak", "sak", "saak"],
  palak: ["palak", "paalak", "palok"],
  tomato: ["tomato", "tamato", "tameto"],
  kathal: ["kathal", "kathaal", "kaathal"],
  pui: ["pui", "pooi", "poo-ee"],

  // Spices
  haldi: ["haldi", "holdi", "holdee", "haldee"],
  jeera: ["jeera", "jira", "zira", "zeera"],
  dhoniya: ["dhoniya", "dhonea", "dhaniya", "dhania"],
  elach: ["elach", "elaach", "elaichi", "elaychi"],
  dalchini: ["dalchini", "daalchini", "dalcheeni"],
  lalbog: ["lalbog", "labong", "lobongo"],
  tejpata: ["tejpata", "tezpata", "tej-pata"],

  // Proteins
  murgi: ["murgi", "murgee", "moorgi"],
  mach: ["mach", "maach", "maachh"],
  dim: ["dim", "deem"],
  mangsho: ["mangsho", "mangso", "mangsoh"],
  ilish: ["ilish", "ilish", "eelish"],
  chingri: ["chingri", "chingree", "chingrhi"],

  // Grains & Pulses
  chal: ["chal", "chaal", "chall"],
  dal: ["dal", "daal", "dhal"],
  moong: ["moong", "mung", "moongdal"],
  chola: ["chola", "chhola", "chholaa"],
  masoor: ["masoor", "masur", "mashoor"],

  // Dairy
  dud: ["dud", "dudh", "doodh"],
  doi: ["doi", "dohi", "dahi"],
  panir: ["panir", "paneer", "paner"],
  ghee: ["ghee", "ghi"],

  // Common items
  tel: ["tel", "tail", "tel"],
  noon: ["noon", "nun", "lon"],
  chini: ["chini", "cheeni", "chinee"],
  gur: ["gur", "guur"],
};

/**
 * Normalize phonetic input to handle common variations
 */
export function normalizePhonetic(input: string): string {
  const normalized = input.toLowerCase().trim();

  // Check if it matches any known variation
  for (const [base, variations] of Object.entries(commonPhoneticVariations)) {
    if (variations.includes(normalized)) {
      return base;
    }
  }

  return normalized;
}

/**
 * Generate phonetic variations for a given English word
 * This helps match ingredients even without explicit phonetic data
 */
export function generatePhoneticVariations(word: string): string[] {
  const variations = new Set<string>([word.toLowerCase()]);
  const normalized = word.toLowerCase();

  // Add common suffix variations
  variations.add(normalized.replace(/y$/i, "i"));
  variations.add(normalized.replace(/i$/i, "y"));
  variations.add(normalized.replace(/ee$/i, "i"));
  variations.add(normalized.replace(/oo$/i, "u"));

  // Add doubled vowel variations
  variations.add(normalized.replace(/a/g, "aa"));
  variations.add(normalized.replace(/e/g, "ee"));
  variations.add(normalized.replace(/i/g, "ii"));
  variations.add(normalized.replace(/o/g, "oo"));
  variations.add(normalized.replace(/u/g, "uu"));

  // Add common consonant variations
  variations.add(normalized.replace(/c/g, "k"));
  variations.add(normalized.replace(/k/g, "c"));
  variations.add(normalized.replace(/ph/g, "f"));
  variations.add(normalized.replace(/f/g, "ph"));

  return Array.from(variations);
}

/**
 * Create searchable text from ingredient for fuzzy matching
 * Combines English, Bangla, and phonetic variations
 */
export function createSearchableText(ingredient: {
  name_en: string;
  name_bn: string;
  phonetic?: string | string[];
}): string {
  const parts: string[] = [
    ingredient.name_en.toLowerCase(),
    ingredient.name_bn,
  ];

  // Add phonetic variations if available
  if (ingredient.phonetic) {
    const phoneticArray = Array.isArray(ingredient.phonetic)
      ? ingredient.phonetic
      : [ingredient.phonetic];
    parts.push(...phoneticArray.map((p) => p.toLowerCase()));
  } else {
    // Auto-generate phonetic variations from English name
    const generated = generatePhoneticVariations(ingredient.name_en);
    parts.push(...generated);
  }

  return parts.join(" ");
}

/**
 * Romanize Bangla characters to Latin for better fuzzy matching
 * This is a simplified romanization for search purposes
 */
export function romanizeBangla(text: string): string {
  const banglaToRoman: Record<string, string> = {
    আ: "a",
    অ: "o",
    ই: "i",
    উ: "u",
    এ: "e",
    ও: "o",
    ক: "k",
    খ: "kh",
    গ: "g",
    ঘ: "gh",
    ঙ: "ng",
    চ: "ch",
    ছ: "chh",
    জ: "j",
    ঝ: "jh",
    ঞ: "n",
    ট: "t",
    ঠ: "th",
    ড: "d",
    ঢ: "dh",
    ণ: "n",
    ত: "t",
    থ: "th",
    দ: "d",
    ধ: "dh",
    ন: "n",
    প: "p",
    ফ: "ph",
    ব: "b",
    ভ: "bh",
    ম: "m",
    য: "j",
    র: "r",
    ল: "l",
    শ: "sh",
    ষ: "sh",
    স: "s",
    হ: "h",
    ড়: "r",
    ঢ়: "rh",
    য়: "y",
    "ং": "ng",
    "ঃ": "h",
    "ঁ": "n",
    "া": "a",
    "ি": "i",
    "ী": "i",
    "ু": "u",
    "ূ": "u",
    "ে": "e",
    "ৈ": "oi",
    "ো": "o",
    "ৌ": "ou",
    "্": "",
  };

  return text
    .split("")
    .map((char) => banglaToRoman[char] || char)
    .join("");
}
