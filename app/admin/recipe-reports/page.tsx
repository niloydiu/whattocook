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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black">Recipe Reports</h2>
        <p className="text-slate-600">User-submitted reports about recipes</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border">
        {loading ? (
          <div>Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-slate-500">No reports found</div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div key={r.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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
