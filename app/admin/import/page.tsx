"use client";

import { useState } from "react";
import { Youtube, Sparkles, Loader2, CheckCircle, AlertTriangle, Plus, Eye, Save } from "lucide-react";
import AlertModal from "@/components/AlertModal";

interface IngredientMatch {
  input: string;
  matched: string;
  confidence: number;
  matchType: string;
  isNew: boolean;
}

export default function ImportFromYoutube() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [ingredientMatches, setIngredientMatches] = useState<IngredientMatch[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<string>("");
  
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

  function extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
      /youtube\.com\/shorts\/([^&\s]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
      return url;
    }
    return null;
  }

  async function handlePreview() {
    if (!youtubeUrl.trim()) return;

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setAlertConfig({ isOpen: true, title: "Error", message: "Invalid YouTube URL", type: "error" });
      return;
    }

    setImporting(true);
    setPreviewData(null);
    setIngredientMatches([]);
    setWarnings([]);
    setImportStatus("Fetching transcript & calling AI...");

    try {
      const res = await fetch(`/api/youtube/${videoId}?import=true&preview=true`);
      const data = await res.json();

      if (res.ok && data.success) {
        setPreviewData(data.preview);
        setIngredientMatches(data.ingredientMatches || []);
        setWarnings(data.warnings || []);
        setImportStatus("Preview ready — review and confirm");
      } else {
        setImportStatus("");
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: data.error || "Failed to extract recipe",
          type: "error",
        });
      }
    } catch (error: any) {
      setImportStatus("");
      setAlertConfig({ isOpen: true, title: "Error", message: error.message || "Preview failed", type: "error" });
    } finally {
      setImporting(false);
    }
  }

  async function handleConfirmImport() {
    if (!youtubeUrl.trim()) return;

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) return;

    setSaving(true);
    setImportStatus("Saving recipe to database...");

    try {
      const res = await fetch(`/api/youtube/${videoId}?import=true`);
      const data = await res.json();

      if (res.ok && data.success) {
        setPreviewData(null);
        setIngredientMatches([]);
        setImportStatus("Recipe imported successfully!");
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: `Successfully imported recipe: ${data.recipe?.title_en || "Unknown"}`,
          type: "success",
        });
        setYoutubeUrl("");
      } else {
        setImportStatus("");
        setAlertConfig({ isOpen: true, title: "Error", message: data.error || "Failed to import recipe", type: "error" });
      }
    } catch (error: any) {
      setImportStatus("");
      setAlertConfig({ isOpen: true, title: "Error", message: error.message || "Import failed", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Import from YouTube</h2>
        <p className="text-gray-600">
          Paste a YouTube cooking video URL — AI extracts the full recipe automatically
        </p>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <Youtube className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">YouTube Video URL</h3>
            <p className="text-sm text-gray-600">Paste a full URL or video ID</p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or paste video ID"
            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-lg"
            disabled={importing || saving}
            onKeyDown={(e) => e.key === "Enter" && handlePreview()}
          />

          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              disabled={importing || saving || !youtubeUrl.trim()}
              className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3"
            >
              {importing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  {importStatus || "Analyzing..."}
                </>
              ) : (
                <>
                  <Eye size={24} />
                  Preview Recipe
                </>
              )}
            </button>

            {previewData && (
              <button
                onClick={handleConfirmImport}
                disabled={saving}
                className="flex-1 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={24} />
                    Confirm & Import
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
          <h3 className="text-lg font-black text-yellow-900 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Auto-Fix Warnings
          </h3>
          <ul className="space-y-1 text-sm text-yellow-800">
            {warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview Data */}
      {previewData && (
        <div className="space-y-6">
          {/* Recipe Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-4">Recipe Preview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-bold text-gray-500">Title (EN):</span> {previewData.title_en}</div>
              <div><span className="font-bold text-gray-500">Title (BN):</span> {previewData.title_bn}</div>
              <div><span className="font-bold text-gray-500">Cuisine:</span> {previewData.cuisine}</div>
              <div><span className="font-bold text-gray-500">Category:</span> {previewData.category}</div>
              <div><span className="font-bold text-gray-500">Difficulty:</span> {previewData.difficulty}</div>
              <div><span className="font-bold text-gray-500">Servings:</span> {previewData.servings}</div>
              <div><span className="font-bold text-gray-500">Prep Time:</span> {previewData.prep_time} min</div>
              <div><span className="font-bold text-gray-500">Cook Time:</span> {previewData.cook_time} min</div>
            </div>
          </div>

          {/* Ingredient Matches */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-4">
              Ingredients ({ingredientMatches.length})
            </h3>
            <div className="space-y-2">
              {ingredientMatches.map((match, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm ${
                    match.isNew
                      ? "bg-yellow-50 border border-yellow-200"
                      : match.matchType === "exact"
                      ? "bg-green-50 border border-green-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {match.isNew ? (
                      <Plus size={16} className="text-yellow-600" />
                    ) : (
                      <CheckCircle size={16} className="text-green-600" />
                    )}
                    <span className="font-medium">{match.input}</span>
                    {match.input !== match.matched && (
                      <span className="text-gray-500">→ {match.matched}</span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    match.isNew
                      ? "bg-yellow-200 text-yellow-800"
                      : match.matchType === "exact"
                      ? "bg-green-200 text-green-800"
                      : "bg-blue-200 text-blue-800"
                  }`}>
                    {match.isNew ? "NEW" : match.matchType.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps Preview */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-4">
              Steps ({previewData.steps?.length || 0})
            </h3>
            <div className="space-y-3">
              {previewData.steps?.map((step: any, i: number) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    {step.step_number}
                  </span>
                  <div>
                    <p>{step.instruction_en}</p>
                    <p className="text-gray-500 mt-0.5">{step.instruction_bn}</p>
                    {step.timestamp && (
                      <span className="text-xs text-blue-600">⏱ {step.timestamp}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw JSON */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-green-400">Raw JSON</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(previewData, null, 2));
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Copy
              </button>
            </div>
            <pre className="text-xs text-green-300 overflow-x-auto bg-gray-800 p-4 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-black text-blue-900 mb-4">How it works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">1</span>
            <span className="font-medium">Paste a YouTube cooking video URL</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">2</span>
            <span className="font-medium">Click "Preview Recipe" — AI analyzes the video and extracts everything</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">3</span>
            <span className="font-medium">Review the extracted data, ingredient matches, and translations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">4</span>
            <span className="font-medium">Click "Confirm & Import" to save to the database</span>
          </li>
        </ul>
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
