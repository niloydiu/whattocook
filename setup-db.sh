#!/bin/bash

echo "🔧 Setting up database..."
echo ""

# Generate Prisma client
echo "1️⃣ Generating Prisma client..."
npx prisma generate

echo ""
echo "2️⃣ Pushing schema to database..."
npx prisma db push --accept-data-loss

echo ""
echo "3️⃣ Checking database tables..."
psql postgresql://niloy@localhost:5432/whattocook -c "\dt"

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Now you can:"
echo "  1. Go to http://localhost:3000/admin/add-recipe"
echo "  2. Paste your recipe JSON"
echo "  3. Click 'Create Recipe'"
