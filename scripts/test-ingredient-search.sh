#!/bin/bash

# Test the ingredient search functionality

echo "🧪 Testing Ingredient Search API..."
echo ""

# Test 1: Search with cauliflower and flour
echo "Test 1: Searching recipes with 'cauliflower' and 'flour'"
curl -X POST http://localhost:3000/api/recipes/search-by-ingredients \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["cauliflower", "flour"]}' \
  | jq '.total, .recipes[0].recipe.title_en, .recipes[0].matchPercent'

echo ""
echo "---"
echo ""

# Test 2: Search with potato and egg
echo "Test 2: Searching recipes with 'potato' and 'egg'"
curl -X POST http://localhost:3000/api/recipes/search-by-ingredients \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["potato", "egg"]}' \
  | jq '.total, .recipes[0].recipe.title_en, .recipes[0].matchPercent'

echo ""
echo "---"
echo ""

# Test 3: Search with Bangla ingredient
echo "Test 3: Searching recipes with 'ফুলকপি' (cauliflower in Bangla)"
curl -X POST http://localhost:3000/api/recipes/search-by-ingredients \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["ফুলকপি"]}' \
  | jq '.total, .recipes[0].recipe.title_en'

echo ""
echo "✅ API Tests Complete!"
