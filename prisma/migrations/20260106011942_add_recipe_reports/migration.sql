-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "foodCategory" TEXT DEFAULT 'Savory';

-- CreateTable
CREATE TABLE "RecipeRequest" (
    "id" SERIAL NOT NULL,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "title" TEXT,
    "description" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "recipeData" JSONB,
    "ingredients" TEXT[],
    "recipeName" TEXT,
    "youtubeUrl" TEXT,
    "adminNotes" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeReport" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "reporter_name" TEXT,
    "reporter_email" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipeRequest_status_idx" ON "RecipeRequest"("status");

-- CreateIndex
CREATE INDEX "RecipeRequest_requestType_idx" ON "RecipeRequest"("requestType");

-- CreateIndex
CREATE INDEX "RecipeRequest_createdAt_idx" ON "RecipeRequest"("createdAt");

-- CreateIndex
CREATE INDEX "RecipeReport_recipe_id_idx" ON "RecipeReport"("recipe_id");

-- CreateIndex
CREATE INDEX "RecipeReport_status_idx" ON "RecipeReport"("status");

-- CreateIndex
CREATE INDEX "Recipe_foodCategory_idx" ON "Recipe"("foodCategory");

-- AddForeignKey
ALTER TABLE "RecipeReport" ADD CONSTRAINT "RecipeReport_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
