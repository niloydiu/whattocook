/**
 * Fuzzy Search Test Suite for whattocook?
 *
 * This file demonstrates the Universal Search Engine capabilities:
 * - English search
 * - Bangla search
 * - Phonetic Bangla (Transliteration) search
 * - Fuzzy matching with spelling variations
 */

import {
  normalizePhonetic,
  romanizeBangla,
  generatePhoneticVariations,
} from "./phoneticUtils";

// Test Cases
export const testCases = {
  // Test 1: Phonetic variations of "Potato"
  potato: {
    queries: ["Alu", "aalu", "aloo", "aaloo"],
    expected: "Potato (আলু)",
    description: 'Should find "Potato" when typing phonetic variations',
  },

  // Test 2: Phonetic variations of "Chili"
  chili: {
    queries: ["Morich", "morish", "marich", "marish"],
    expected: "Chili (মরিচ)",
    description: 'Should find "Chili" when typing phonetic variations',
  },

  // Test 3: Phonetic variations of "Eggplant"
  eggplant: {
    queries: ["Begun", "bagun", "baegun", "begoon"],
    expected: "Eggplant (বেগুন)",
    description: 'Should find "Eggplant" when typing phonetic variations',
  },

  // Test 4: Phonetic variations of "Onion"
  onion: {
    queries: ["Piaz", "Piyaj", "Peaj", "peyaj", "piyaz"],
    expected: "Onion (পেঁয়াজ)",
    description: 'Should find "Onion" when typing phonetic variations',
  },

  // Test 5: Phonetic variations of "Jackfruit"
  jackfruit: {
    queries: ["Kathal", "kathaal", "kaathal"],
    expected: "Jackfruit (কাঁঠাল)",
    description: 'Should find "Jackfruit" when typing phonetic variations',
  },

  // Test 6: English search
  english: {
    queries: ["Chicken", "chicken", "CHICKEN", "chick"],
    expected: "Chicken (চিকেন)",
    description: 'Should find "Chicken" with case-insensitive English search',
  },

  // Test 7: Bangla search
  bangla: {
    queries: ["আলু", "রসুন", "পেঁয়াজ"],
    expected: "Should match Bangla characters directly",
    description: "Should support direct Bangla character search",
  },

  // Test 8: Partial matches
  partial: {
    queries: ["tom", "toma", "tomat"],
    expected: "Tomato (টমেটো)",
    description: "Should find matches even with partial input",
  },

  // Test 9: Misspellings
  misspellings: {
    queries: ["chcken", "chiken", "chikn"],
    expected: "Chicken (চিকেন)",
    description: "Should handle common misspellings with fuzzy matching",
  },

  // Test 10: Mixed case
  mixedCase: {
    queries: ["ChIcKeN", "oNiOn", "GaRlIc"],
    expected: "Should be case-insensitive",
    description: "Should handle mixed case input",
  },
};

/**
 * Run phonetic normalization tests
 */
export function testPhoneticNormalization() {
  console.log("=== PHONETIC NORMALIZATION TESTS ===\n");

  const tests = [
    { input: "Piaz", expected: "piaz" },
    { input: "Piyaj", expected: "piaz" },
    { input: "Peaj", expected: "piaz" },
    { input: "Alu", expected: "alu" },
    { input: "aloo", expected: "alu" },
    { input: "Morich", expected: "morich" },
    { input: "morish", expected: "morich" },
  ];

  tests.forEach(({ input, expected }) => {
    const result = normalizePhonetic(input);
    const passed = result === expected;
    console.log(
      `${
        passed ? "✅" : "❌"
      } "${input}" → "${result}" (expected: "${expected}")`
    );
  });

  console.log("\n");
}

/**
 * Run Bangla romanization tests
 */
export function testBanglaRomanization() {
  console.log("=== BANGLA ROMANIZATION TESTS ===\n");

  const tests = [
    { input: "আলু", expected: "alu" },
    { input: "পেঁয়াজ", expected: "penyaj" },
    { input: "রসুন", expected: "rosun" },
    { input: "টমেটো", expected: "tometo" },
    { input: "চিকেন", expected: "chiken" },
  ];

  tests.forEach(({ input, expected }) => {
    const result = romanizeBangla(input);
    console.log(
      `"${input}" → "${result}" (expected similar to: "${expected}")`
    );
  });

  console.log("\n");
}

/**
 * Run phonetic variation generation tests
 */
export function testPhoneticVariations() {
  console.log("=== PHONETIC VARIATION GENERATION TESTS ===\n");

  const tests = ["Chicken", "Onion", "Potato", "Garlic"];

  tests.forEach((word) => {
    const variations = generatePhoneticVariations(word);
    console.log(
      `"${word}" variations:`,
      variations.slice(0, 5).join(", "),
      "..."
    );
  });

  console.log("\n");
}

/**
 * How to use the fuzzy search in your component:
 *
 * ```tsx
 * import { useFuzzyIngredientSearch } from '../hooks/useFuzzySearch';
 *
 * function MyComponent() {
 *   const [searchQuery, setSearchQuery] = useState('');
 *
 *   const results = useFuzzyIngredientSearch(ingredients, searchQuery, {
 *     limit: 10,
 *     threshold: 0.35  // Lower = more strict, Higher = more lenient
 *   });
 *
 *   return (
 *     <div>
 *       <input
 *         value={searchQuery}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *         placeholder="Type: Alu, Morich, Begun..."
 *       />
 *
 *       {results.map(result => (
 *         <div key={result.ingredient.id}>
 *           {result.ingredient.name_en} ({result.ingredient.name_bn})
 *           {result.isClosestGuess && <span>Closest Match</span>}
 *           <small>Score: {result.score.toFixed(2)}</small>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

export const usageExample = `
// 1. Type "Alu" → Should show "Potato (আলু)"
// 2. Type "aloo" → Should still show "Potato (আলু)"
// 3. Type "Morich" → Should show "Chili (মরিচ)"
// 4. Type "Begun" → Should show "Eggplant (বেগুন)"
// 5. Type "Piaz" → Should show "Onion (পেঁয়াজ)"
// 6. Type "Kathal" → Should show "Jackfruit (কাঁঠাল)"

// The fuzzy search works because:
// - Threshold of 0.35 catches spelling variations
// - Phonetic mappings handle transliteration
// - Romanized Bangla enables cross-language search
// - No manual phonetic data needed for all 1200+ ingredients
`;

/**
 * Expected Search Results for Common Queries
 */
export const expectedResults = {
  alu: ["Potato", "Cauliflower"],
  aloo: ["Potato"],
  piaz: ["Onion"],
  piyaj: ["Onion"],
  morich: ["Chili", "Green Chili"],
  begun: ["Eggplant"],
  kathal: ["Jackfruit"],
  tomato: ["Tomato"],
  টমেটো: ["Tomato"],
  আলু: ["Potato"],
  chicken: ["Chicken"],
  chiken: ["Chicken"], // Misspelling should still work
};

// Run all tests (for development/debugging)
if (typeof window === "undefined") {
  testPhoneticNormalization();
  testBanglaRomanization();
  testPhoneticVariations();
}
