import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const JWT_SECRET_KEY = process.env.JWT_SECRET ?? process.env.ADMIN_SECRET ?? "";
const TOKEN_EXPIRY = "24h";

function getSecretKey(): Uint8Array {
  if (!JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(JWT_SECRET_KEY);
}

export interface AdminTokenPayload {
  sub: number;
  username: string;
}

export async function signToken(adminId: number, username: string): Promise<string> {
  return new jose.SignJWT({ sub: adminId, username } as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, getSecretKey());
    return {
      sub: payload.sub as unknown as number,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}

export async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  const payload = await verifyToken(token);
  return payload !== null;
}

export async function getAdminFromRequest(request: NextRequest): Promise<AdminTokenPayload | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
