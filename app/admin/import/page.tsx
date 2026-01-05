"use client";

import { useState } from "react";
import { Youtube, Sparkles, Loader2, CheckCircle } from "lucide-react";
import AlertModal from "@/components/AlertModal";

export default function ImportFromYoutube() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [importing, setImporting] = useState(false);
  
  // Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  async function handleImport() {
    if (!youtubeUrl.trim()) return;

    setImporting(true);

    try {
      // Extract video ID from URL
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: "Invalid YouTube URL",
          type: "error",
        });
        setImporting(false);
        return;
      }

      // Call API to extract and import recipe
      const res = await fetch("/api/youtube/" + videoId + "?import=true");
      const data = await res.json();

      if (res.ok && data.success) {
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: `Successfully imported recipe: ${data.recipe?.title_en || "Unknown"}`,
          type: "success",
        });
        setYoutubeUrl("");
      } else {
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: data.error || "Failed to import recipe. Please try manually.",
          type: "error",
        });
      }
    } catch (error: any) {
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: error.message || "Import failed",
        type: "error",
      });
    } finally {
      setImporting(false);
    }
  }

  function extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    // If it looks like just an ID
    if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
      return url;
    }

    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Import from YouTube</h2>
        <p className="text-gray-600">
          Extract recipe data from YouTube cooking videos using AI
        </p>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <Youtube className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">YouTube Video URL</h3>
            <p className="text-sm text-gray-600">Paste the URL of a cooking video</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Video URL</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-lg"
              disabled={importing}
            />
            <p className="text-xs text-gray-500 mt-2">
              Supports: youtube.com/watch?v=..., youtu.be/..., or just the video ID
            </p>
          </div>

          <button
            onClick={handleImport}
            disabled={importing || !youtubeUrl.trim()}
            className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3"
          >
            {importing ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Importing...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Import Recipe with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-black text-blue-900 mb-4">How it works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
              1
            </span>
            <span className="font-medium">Paste a YouTube cooking video URL</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
              2
            </span>
            <span className="font-medium">
              AI analyzes the video and extracts ingredients, steps, and timings
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
              3
            </span>
            <span className="font-medium">Recipe is automatically created in both English and বাংলা</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
              4
            </span>
            <span className="font-medium">Missing ingredients are auto-created with images</span>
          </li>
        </ul>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
        <h3 className="text-lg font-black text-yellow-900 mb-2">⚠️ Note</h3>
        <p className="text-sm text-yellow-800 font-medium">
          This feature requires AI integration. If it's not working, you can manually add recipes
          using the "Add Recipe" option with AI-generated JSON from tools like ChatGPT or Claude.
        </p>
      </div>

      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
