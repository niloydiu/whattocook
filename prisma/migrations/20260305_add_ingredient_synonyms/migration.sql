-- Add synonyms column to Ingredient
ALTER TABLE "Ingredient"
ADD COLUMN IF NOT EXISTS "synonyms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
