import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/adminAuth";
import { validateBody, LoginSchema } from "@/lib/validation/schemas";
import { logAudit } from "@/lib/auditLog";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(LoginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.errors },
        { status: 400 }
      );
    }
    const { username, password } = validation.data;

    const admin = await prisma.admin.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await signToken(admin.id, admin.username);

    await logAudit({
      adminId: admin.id,
      action: "admin.login",
      entityType: "admin",
      entityId: admin.id,
      details: "Admin logged in",
    });

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
