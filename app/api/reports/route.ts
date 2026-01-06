import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/adminAuth";

// GET /api/reports - list reports (admin)
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) return unauthorizedResponse();
  try {
    const reports = await prisma.recipeReport.findMany({
      orderBy: { createdAt: "desc" },
      include: { recipe: { select: { id: true, slug: true, title_en: true, title_bn: true } } },
    });
    return NextResponse.json({ reports });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

// POST /api/reports - create a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId, reporterName, reporterEmail, reason, details } = body;
    if (!recipeId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.recipeReport.create({
      data: {
        recipe_id: Number(recipeId),
        reporter_name: reporterName || null,
        reporter_email: reporterEmail || null,
        reason,
        details: details || null,
      },
    });

    return NextResponse.json({ success: true, report: created });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}

// DELETE /api/reports - bulk delete reports (admin)
export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) return unauthorizedResponse();
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    await prisma.recipeReport.deleteMany({
      where: { id: { in: ids.map(Number) } },
    });

    return NextResponse.json({ success: true, message: "Reports deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete reports" }, { status: 500 });
  }
}
