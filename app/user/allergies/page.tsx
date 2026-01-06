"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function MyAllergiesPage() {
  const [user, setUser] = useState<any>(null);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [newAllergy, setNewAllergy] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser((data as any)?.session?.user ?? null);
    })();
    const sub = supabase.auth.onAuthStateChange((_event: string, session: any) => setUser(session?.user ?? null));
    return () => { mounted = false; try { sub.subscription.unsubscribe(); } catch (e) {} };
  }, []);

  useEffect(() => {
    (async () => {
      // allergies management is server-only and requires login
      if (!user) {
        setAllergies([]);
        return;
      }

      try {
        const { data: sessionResp } = await supabase.auth.getSession();
        const token = (sessionResp as any)?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/user/allergies`, { headers });
        const json = await res.json();
        if (!json.error && Array.isArray(json.allergies)) setAllergies(json.allergies);
      } catch (e) { setAllergies([]); }
    })();
  }, [user]);

  const add = async () => {
    if (!newAllergy.trim()) return;
    // require login for server-side allergy creation/linking
    if (!user) {
      // prompt sign-in
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
      return;
    }

    try {
      const { data: sessionResp } = await supabase.auth.getSession();
      const token = (sessionResp as any)?.session?.access_token;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/user/allergies`, { method: "POST", headers, body: JSON.stringify({ name_en: newAllergy.trim() }) });
      const json = await res.json();
      if (!json.error) setAllergies((prev) => [...prev, json.allergy]);
      setNewAllergy("");
    } catch (e) {}
  };

  const remove = async (id: any) => {
    // require login for server-side allergy removal
    if (!user) {
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
      return;
    }
    try {
      const { data: sessionResp } = await supabase.auth.getSession();
      const token = (sessionResp as any)?.session?.access_token;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`/api/user/allergies`, { method: "DELETE", headers, body: JSON.stringify({ id }) });
      setAllergies((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {}
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">My Allergies</h1>
      <div className="mb-4 flex gap-2">
        <input value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="e.g., Peanut" className="flex-1 border px-3 py-2 rounded" />
        <button onClick={add} className="bg-red-500 text-white px-4 rounded">Add</button>
      </div>
      {allergies.length === 0 ? (
        <p className="text-muted">No allergies set. Add items you are allergic to so we can warn you when a recipe contains them.</p>
      ) : (
        <ul className="space-y-2">
          {allergies.map((a) => (
            <li key={a.id} className="flex justify-between items-center border rounded p-2">
              <div>{a.name_en || a.name_bn}</div>
              <button className="text-sm text-red-600" onClick={() => remove(a.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
