import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

function ensureSupabaseConfigured() {
  if (!SUPABASE_URL) {
    return NextResponse.json(
      { error: "SUPABASE_URL is not set — chat history requires Supabase configuration (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL)." },
      { status: 500 }
    );
  }
  return null;
}

async function getUserIdFromAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !SUPABASE_URL) return null;
  try {
    // Call Supabase Auth REST endpoint to get user for the provided access token
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: auth },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.id || null;
  } catch (e) {
    console.warn("Failed to validate supabase token:", e);
    return null;
  }
}

// GET /api/chat/history
export async function GET(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;
    const userId = await getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await prisma.chatSession.findUnique({ where: { userId } });
    if (!session) return NextResponse.json({ messages: [] });
    return NextResponse.json({ messages: session.messages });
  } catch (err) {
    console.error("/api/chat/history GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/chat/history
// Body: { messages: Array } — client must provide Authorization: Bearer <access_token>
export async function POST(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;
    const userId = await getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { messages, delta } = body;
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages must be an array" }, { status: 400 });
    }

    if (delta) {
      // Append-only write: append the provided array to the existing JSONB array using SQL concat.
      // If no existing session, create one with the provided messages.
      try {
        // Try to update existing row by concatenating JSONB arrays
        const appended = await prisma.$executeRawUnsafe(
          `UPDATE "ChatSession" SET messages = COALESCE(messages, '[]'::jsonb) || $1::jsonb, "updatedAt" = now() WHERE "userId" = $2`,
          JSON.stringify(messages),
          userId
        );

        if (appended === 0) {
          // No row updated — create a new session
          const created = await prisma.chatSession.create({ data: { userId, messages } });
          return NextResponse.json({ success: true, session: created });
        }

        // Optional compaction: keep only last 200 messages to limit growth
        await prisma.$executeRawUnsafe(
          `UPDATE "ChatSession" SET messages = (
             SELECT jsonb_agg(elem) FROM (
               SELECT elem FROM jsonb_array_elements(messages) WITH ORDINALITY t(elem, idx)
               WHERE idx > (jsonb_array_length(messages) - 200)
               ORDER BY idx
             ) s
           ) WHERE "userId" = $1`,
          userId
        );

        const session = await prisma.chatSession.findUnique({ where: { userId } });
        return NextResponse.json({ success: true, session });
      } catch (e) {
        console.error("Delta append failed:", e);
        return NextResponse.json({ error: "Failed to append messages" }, { status: 500 });
      }
    }

    // Fallback: full upsert (replace messages)
    const upserted = await prisma.chatSession.upsert({
      where: { userId },
      create: { userId, messages },
      update: { messages },
    });

    return NextResponse.json({ success: true, session: upserted });
  } catch (err) {
    console.error("/api/chat/history POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
