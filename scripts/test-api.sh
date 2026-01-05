#!/bin/bash
set -e

BASE_URL="http://localhost:3000"
SLUG="e2e-test-$(date +%s)"

echo "🚀 Starting E2E API Test for slug: $SLUG"

# 1. Create Recipe
echo "📦 Creating recipe..."
CREATE_RES=$(curl -s -X POST "$BASE_URL/api/recipes" \
  -H "Content-Type: application/json" \
  -d "{
    \"slug\": \"$SLUG\",
    \"title_en\": \"E2E Test Recipe\",
    \"title_bn\": \"ই টু ই টেস্ট\",
    \"image\": \"https://example.com/e2e.jpg\",
    \"youtube_url\": \"https://youtube.com/e2e\",
    \"ingredients\": [
      { \"name_en\": \"E2E Salt\", \"name_bn\": \"ই টু ই লবণ\", \"quantity\": \"1 tsp\" },
      { \"name_en\": \"E2E Chili\", \"quantity\": \"2 pcs\" }
    ],
    \"createMissing\": true
  }")

if echo "$CREATE_RES" | grep -q "error"; then
  echo "❌ Create failed: $CREATE_RES"
  exit 1
fi
echo "✅ Create successful"

# 2. Read Recipe
echo "📖 Reading recipe..."
GET_RES=$(curl -s "$BASE_URL/api/recipes/$SLUG")
if echo "$GET_RES" | grep -q "error"; then
  echo "❌ Read failed: $GET_RES"
  exit 1
fi
echo "✅ Read successful"

# 3. Update Recipe
echo "📝 Updating recipe..."
UPDATE_RES=$(curl -s -X PUT "$BASE_URL/api/recipes/$SLUG" \
  -H "Content-Type: application/json" \
  -d "{ \"title_en\": \"Updated E2E Title\" }")

if echo "$UPDATE_RES" | grep -q "error"; then
  echo "❌ Update failed: $UPDATE_RES"
  exit 1
fi
echo "✅ Update successful"

# 4. Delete Recipe
echo "🗑️ Deleting recipe..."
DELETE_RES=$(curl -s -X DELETE "$BASE_URL/api/recipes/$SLUG")
if echo "$DELETE_RES" | grep -q "error"; then
  echo "❌ Delete failed: $DELETE_RES"
  exit 1
fi
echo "✅ Delete successful"

# 5. Verify Deletion
echo "🔍 Verifying deletion..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/recipes/$SLUG")
if [ "$STATUS" -eq 404 ]; then
  echo "✅ Deletion verified (404)"
else
  echo "❌ Deletion verification failed (Status: $STATUS)"
  exit 1
fi

echo "🎉 All E2E tests passed!"
