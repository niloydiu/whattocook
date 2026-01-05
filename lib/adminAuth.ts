import { NextRequest, NextResponse } from "next/server";

export function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7);

  try {
    // Decode the base64 token
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [adminId, username, timestamp] = decoded.split(":");

    // Check if token is not older than 24 hours (86400000 ms)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 86400000) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function verifyToken(token: string): boolean {
  if (!token) return false;

  try {
    // Decode the base64 token
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [adminId, username, timestamp] = decoded.split(":");

    if (!adminId || !username || !timestamp) return false;

    // Check if token is not older than 24 hours (86400000 ms)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 86400000) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
