"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  id: number;
  recipe_id: number;
  reporter_name?: string | null;
  reporter_email?: string | null;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  recipe?: { id: number; slug: string; title_en: string; title_bn: string } | null;
};

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) fetchReports();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} reports?`)) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setReports(reports.filter(r => !selectedIds.includes(r.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  function toggleOne(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Recipe Reports</h2>
          <p className="text-slate-600">User-submitted reports about recipes</p>
        </div>
        
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            Delete {selectedIds.length} Selected
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border">
        {loading ? (
          <div>Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-slate-500">No reports found</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <input
                type="checkbox"
                checked={reports.length > 0 && selectedIds.length === reports.length}
                onChange={() => {
                  if (selectedIds.length === reports.length) setSelectedIds([]);
                  else setSelectedIds(reports.map(r => r.id));
                }}
                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-bold text-slate-700">Select All ({reports.length})</span>
            </div>

            {reports.map((r) => (
              <div key={r.id} className={`p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${selectedIds.includes(r.id) ? 'bg-red-50/20 border-red-200' : ''}`}>
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r.id)}
                    onChange={() => toggleOne(r.id)}
                    className="w-5 h-5 mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="text-sm text-slate-400">#{r.id} • {new Date(r.createdAt).toLocaleString()}</div>
                    <div className="font-bold text-slate-900">{r.reason}</div>
                    <div className="text-sm text-slate-600">{r.details}</div>
                    <div className="mt-2 text-xs text-slate-500">Reporter: {r.reporter_name || "—"} {r.reporter_email ? `• ${r.reporter_email}` : ""}</div>
                    {r.recipe && (
                      <div className="mt-2 text-xs">
                        Recipe: <Link href={`/recipes/${r.recipe.slug}`} className="text-red-600 font-bold">{r.recipe.title_en}</Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${r.status === 'open' ? 'bg-red-50 text-red-600' : r.status === 'reviewed' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                    {r.status}
                  </div>
                  {r.status !== 'reviewed' && (
                    <button onClick={() => updateStatus(r.id, 'reviewed')} className="px-3 py-1 bg-yellow-100 rounded font-bold">Mark Reviewed</button>
                  )}
                  {r.status !== 'closed' && (
                    <button onClick={() => updateStatus(r.id, 'closed')} className="px-3 py-1 bg-green-100 rounded font-bold">Close</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
