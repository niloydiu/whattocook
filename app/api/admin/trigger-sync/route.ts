import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  const token = process.env.GITHUB_ADMIN_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Server missing GitHub token" }, { status: 500 });
  }

  const owner = "niloydiu";
  const repo = "whattocook";
  const workflow_id = "export-remote.yml";
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: "main" }),
  });

  if (resp.status === 204) {
    return NextResponse.json({ ok: true });
  }

  const text = await resp.text();
  return NextResponse.json({ ok: false, status: resp.status, detail: text }, { status: 500 });
}
