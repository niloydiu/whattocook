import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, context: any) {
  const { params } = context;
  try {
    const id = Number(params.id);
    const report = await prisma.recipeReport.findUnique({
      where: { id },
      include: { recipe: { select: { id: true, slug: true, title_en: true, title_bn: true } } },
    });
    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ report });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: any) {
  const { params } = context;
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { status } = body;
    if (!["open", "reviewed", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const updated = await prisma.recipeReport.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, report: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
