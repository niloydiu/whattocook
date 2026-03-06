-- Add viewCount column to Recipe
ALTER TABLE "Recipe"
ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
