import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/recipe-requests/:id - Get a single recipe request
export async function GET(request: NextRequest, context: any) {
  const { params } = context;
  try {
    const id = parseInt(params.id);

    const recipeRequest = await prisma.recipeRequest.findUnique({
      where: { id },
    });

    if (!recipeRequest) {
      return NextResponse.json(
        { error: "Recipe request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recipeRequest);
  } catch (error) {
    console.error("Error fetching recipe request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/recipe-requests/:id - Update recipe request status
export async function PATCH(request: NextRequest, context: any) {
  const { params } = context;
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { status, adminNotes, processedBy } = body;

    if (status && !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, approved, or rejected" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      updateData.processedAt = new Date();
    }
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (processedBy) updateData.processedBy = processedBy;

    const updated = await prisma.recipeRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Recipe request updated successfully",
      request: updated,
    });
  } catch (error) {
    console.error("Error updating recipe request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/recipe-requests/:id - Delete a recipe request
export async function DELETE(request: NextRequest, context: any) {
  const { params } = context;
  try {
    const id = parseInt(params.id);

    await prisma.recipeRequest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Recipe request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recipe request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
