-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "phonetic" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_bn" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "youtube_url" TEXT NOT NULL,
    "youtube_id" TEXT,
    "cuisine" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "prep_time" INTEGER NOT NULL,
    "cook_time" INTEGER NOT NULL,
    "servings" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantity" TEXT NOT NULL,
    "unit_en" TEXT NOT NULL,
    "unit_bn" TEXT NOT NULL,
    "notes_en" TEXT,
    "notes_bn" TEXT,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "step_number" INTEGER NOT NULL,
    "instruction_en" TEXT NOT NULL,
    "instruction_bn" TEXT NOT NULL,
    "timestamp" TEXT,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeBlogContent" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "intro_en" TEXT NOT NULL,
    "intro_bn" TEXT NOT NULL,
    "what_makes_it_special_en" TEXT NOT NULL,
    "what_makes_it_special_bn" TEXT NOT NULL,
    "cooking_tips_en" TEXT NOT NULL,
    "cooking_tips_bn" TEXT NOT NULL,
    "serving_en" TEXT NOT NULL,
    "serving_bn" TEXT NOT NULL,
    "storage_en" TEXT,
    "storage_bn" TEXT,
    "full_blog_en" TEXT NOT NULL,
    "full_blog_bn" TEXT NOT NULL,

    CONSTRAINT "RecipeBlogContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ingredient_name_en_idx" ON "Ingredient"("name_en");

-- CreateIndex
CREATE INDEX "Ingredient_name_bn_idx" ON "Ingredient"("name_bn");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX "Recipe_slug_idx" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX "Recipe_title_en_idx" ON "Recipe"("title_en");

-- CreateIndex
CREATE INDEX "Recipe_title_bn_idx" ON "Recipe"("title_bn");

-- CreateIndex
CREATE INDEX "Recipe_cuisine_idx" ON "Recipe"("cuisine");

-- CreateIndex
CREATE INDEX "Recipe_category_idx" ON "Recipe"("category");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipe_id_idx" ON "RecipeIngredient"("recipe_id");

-- CreateIndex
CREATE INDEX "RecipeIngredient_ingredient_id_idx" ON "RecipeIngredient"("ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipe_id_ingredient_id_key" ON "RecipeIngredient"("recipe_id", "ingredient_id");

-- CreateIndex
CREATE INDEX "RecipeStep_recipe_id_idx" ON "RecipeStep"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeStep_recipe_id_step_number_key" ON "RecipeStep"("recipe_id", "step_number");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeBlogContent_recipe_id_key" ON "RecipeBlogContent"("recipe_id");

-- CreateIndex
CREATE INDEX "RecipeBlogContent_recipe_id_idx" ON "RecipeBlogContent"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_username_idx" ON "Admin"("username");

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeBlogContent" ADD CONSTRAINT "RecipeBlogContent_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
