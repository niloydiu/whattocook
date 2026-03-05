export type SupabaseHealth = { ok: boolean; status?: number; error?: string };

export async function checkSupabaseHealth(timeout = 2000): Promise<SupabaseHealth> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return { ok: false, error: "NO_URL" };
  const base = url.replace(/\/$/, "");
  const target = `${base}/auth/v1/`;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(target, { method: "GET", signal: controller.signal });
    clearTimeout(id);
    return { ok: res.ok, status: res.status };
  } catch (err: any) {
    clearTimeout(id);
    return { ok: false, error: err?.message ?? String(err) };
  }
}

export function getSupabaseAuthUrl(redirectTo = "/") {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  const base = url.replace(/\/$/, "");
  const redirect = encodeURIComponent(redirectTo);
  return `${base}/auth/v1/authorize?provider=google&redirect_to=${redirect}`;
}
