"use client";

import { useEffect, useState } from "react";
import ReportModal from "@/components/ReportModal";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  ChefHat,
  Play,
  ExternalLink,
  ArrowLeft,
  Eye,
  Youtube as YouTubeIcon,
  Flag,
} from "lucide-react";
import Link from "next/link";

type RecipeIngredient = {
  id: number;
  ingredient_id: number;
  quantity: string;
  unit_en: string;
  unit_bn: string;
  notes_en: string | null;
  notes_bn: string | null;
  ingredient: {
    id: number;
    name_en: string;
    name_bn: string;
    img: string;
  };
};

type RecipeStep = {
  id: number;
  step_number: number;
  instruction_en: string;
  instruction_bn: string;
  timestamp: string | null;
};

type BlogContent = {
  intro_en: string;
  intro_bn: string;
  what_makes_it_special_en: string;
  what_makes_it_special_bn: string;
  cooking_tips_en: string;
  cooking_tips_bn: string;
  serving_en: string;
  serving_bn: string;
  storage_en: string | null;
  storage_bn: string | null;
  full_blog_en: string;
  full_blog_bn: string;
};

type Recipe = {
  id: number;
  slug: string;
  title_en: string;
  title_bn: string;
  image: string;
  youtube_url: string;
  youtube_id: string;
  cuisine: string;
  category: string;
  foodCategory?: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  blogContent: BlogContent | null;
};

function toBengaliNumber(n: number) {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n)
    .split("")
    .map((d) => map[+d] ?? d)
    .join("");
}

function parseTimestamp(timestamp: string | null): number | null {
  if (!timestamp) return null;
  const parts = timestamp.split(":");
  if (parts.length === 2) {
    const [min, sec] = parts;
    return parseInt(min) * 60 + parseInt(sec);
  } else if (parts.length === 3) {
    const [hr, min, sec] = parts;
    return parseInt(hr) * 3600 + parseInt(min) * 60 + parseInt(sec);
  }
  return null;
}

export default function RecipePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<"en" | "bn">("en");
  const [showVideo, setShowVideo] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [videoStats, setVideoStats] = useState<{
    duration: string;
    viewCount: string;
    likeCount?: string;
  } | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipes/${slug}`);
        if (!res.ok) {
          throw new Error("Recipe not found");
        }
        const data = await res.json();
        setRecipe(data);
        
        // Fetch YouTube metadata if video ID exists
        if (data.youtube_id) {
          fetchYouTubeStats(data.youtube_id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [slug]);

  const fetchYouTubeStats = async (videoId: string) => {
    try {
      const res = await fetch(`/api/youtube/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.duration && data.viewCount) {
          setVideoStats({
            duration: data.duration,
            viewCount: data.viewCount,
            likeCount: data.likeCount,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch YouTube stats:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-4">
            Recipe Not Found
          </h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link
            href="/"
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const title = locale === "bn" ? recipe.title_bn : recipe.title_en;
  const totalTime = recipe.prep_time + recipe.cook_time;

  const difficultyColor =
    recipe.difficulty === "Easy"
      ? "bg-green-100 text-green-700"
      : recipe.difficulty === "Medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  const handleTimestampClick = (timestamp: string | null) => {
    if (!timestamp || !recipe.youtube_id) return;
    const seconds = parseTimestamp(timestamp);
    if (seconds !== null) {
      window.open(
        `https://www.youtube.com/watch?v=${recipe.youtube_id}&t=${seconds}s`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold">Back</span>
          </Link>

          <button
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors"
          >
            {locale === "en" ? "বাংলা" : "English"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden shadow-xl mb-8"
        >
          <div className="relative h-96">
            {showVideo && recipe.youtube_id ? (
              <iframe
                src={`https://www.youtube.com/embed/${recipe.youtube_id}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Recipe Video"
              />
            ) : (
              <>
                <img
                  src={recipe.image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {recipe.youtube_id && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-2xl transition-all group-hover:scale-110">
                      <Play size={32} fill="currentColor" className="ml-1" />
                    </div>
                  </button>
                )}
                
                {/* Subtle Report Button on Hero */}
                <button
                  onClick={() => setShowReport(true)}
                  title={locale === "en" ? "Report recipe" : "রিপোর্ট করুন"}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white/50 opacity-40 hover:opacity-100 hover:text-white transition-all z-10"
                >
                  <Flag size={18} />
                  <span className="sr-only">Report</span>
                </button>
              </>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider ${difficultyColor} shadow-sm border border-black/5`}>
                {recipe.difficulty}
              </span>
              <span className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm border border-slate-100">
                {recipe.cuisine}
              </span>
              <span className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm border border-slate-100">
                {recipe.category}
              </span>
              {recipe.foodCategory && (
                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg shadow-black/20">
                  {recipe.foodCategory}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              {title}
            </h1>

            <div className="flex flex-wrap gap-6 text-slate-600">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-red-600" />
                <span className="font-bold">
                  {locale === "bn" ? toBengaliNumber(totalTime) : totalTime} min
                  <span className="text-xs text-slate-400 ml-1">
                    ({locale === "en" ? "Recipe Time" : "রেসিপি সময়"})
                  </span>
                </span>
              </div>
              
              {videoStats?.duration && (
                <div className="flex items-center gap-2">
                  <YouTubeIcon size={20} className="text-red-600" />
                  <span className="font-bold">
                    {videoStats.duration}
                    <span className="text-xs text-slate-400 ml-1">
                      ({locale === "en" ? "Video" : "ভিডিও"})
                    </span>
                  </span>
                </div>
              )}
              
              {videoStats?.viewCount && (
                <div className="flex items-center gap-2">
                  <Eye size={20} className="text-red-600" />
                  <span className="font-bold">
                    {videoStats.viewCount}
                    <span className="text-xs text-slate-400 ml-1">
                      ({locale === "en" ? "views" : "দর্শক"})
                    </span>
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users size={20} className="text-red-600" />
                <span className="font-bold">
                  {locale === "bn"
                    ? toBengaliNumber(recipe.servings)
                    : recipe.servings}{" "}
                  {locale === "en" ? "servings" : "জনের জন্য"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat size={20} className="text-red-600" />
                <span className="font-bold">
                  {locale === "en" ? "Prep" : "প্রস্তুতি"}:{" "}
                  {locale === "bn"
                    ? toBengaliNumber(recipe.prep_time)
                    : recipe.prep_time}{" "}
                  min
                </span>
              </div>
            </div>

            {recipe.youtube_url && (
              <a
                href={recipe.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
              >
                <ExternalLink size={20} />
                {locale === "en" ? "Watch on YouTube" : "ইউটিউবে দেখুন"}
              </a>
            )}
          </div>
        </motion.div>

        {showReport && (
          <ReportModal recipeId={recipe.id} onClose={() => setShowReport(false)} />
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl sticky top-24">
              <h2 className="text-2xl font-black text-slate-900 mb-6">
                {locale === "en" ? "Ingredients" : "উপকরণ"}
              </h2>

              <div className="space-y-4">
                {recipe.ingredients.map((ing, idx) => (
                  <div
                    key={ing.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={ing.ingredient.img}
                      alt={ing.ingredient.name_en}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">
                        {locale === "bn"
                          ? ing.ingredient.name_bn
                          : ing.ingredient.name_en}
                      </p>
                      <p className="text-sm text-slate-600">
                        {ing.quantity} {locale === "bn" ? ing.unit_bn : ing.unit_en}
                      </p>
                      {(locale === "bn" ? ing.notes_bn : ing.notes_en) && (
                        <p className="text-xs text-slate-500 mt-1">
                          {locale === "bn" ? ing.notes_bn : ing.notes_en}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6">
                {locale === "en" ? "Instructions" : "নির্দেশনা"}
              </h2>

              <div className="space-y-6">
                {recipe.steps.map((step) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-black">
                      {locale === "bn"
                        ? toBengaliNumber(step.step_number)
                        : step.step_number}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-700 leading-relaxed mb-2">
                        {locale === "bn"
                          ? step.instruction_bn
                          : step.instruction_en}
                      </p>
                      {step.timestamp && (
                        <button
                          onClick={() => handleTimestampClick(step.timestamp)}
                          className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                        >
                          <Play size={12} />
                          {step.timestamp}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blog Content */}
            {recipe.blogContent && (
              <div className="bg-white rounded-3xl p-8 shadow-xl space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    {locale === "en" ? "Introduction" : "ভূমিকা"}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {locale === "bn"
                      ? recipe.blogContent.intro_bn
                      : recipe.blogContent.intro_en}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    {locale === "en"
                      ? "What Makes It Special"
                      : "কী এটিকে বিশেষ করে তোলে"}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {locale === "bn"
                      ? recipe.blogContent.what_makes_it_special_bn
                      : recipe.blogContent.what_makes_it_special_en}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    {locale === "en" ? "Cooking Tips" : "রান্নার টিপস"}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {locale === "bn"
                      ? recipe.blogContent.cooking_tips_bn
                      : recipe.blogContent.cooking_tips_en}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    {locale === "en" ? "Serving" : "পরিবেশন"}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {locale === "bn"
                      ? recipe.blogContent.serving_bn
                      : recipe.blogContent.serving_en}
                  </p>
                </div>

                {recipe.blogContent.storage_en && (
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">
                      {locale === "en" ? "Storage" : "সংরক্ষণ"}
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {locale === "bn"
                        ? recipe.blogContent.storage_bn
                        : recipe.blogContent.storage_en}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
