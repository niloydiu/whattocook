import prisma from "./prisma";

export type AuditAction =
  | "recipe.create"
  | "recipe.update"
  | "recipe.delete"
  | "ingredient.create"
  | "ingredient.update"
  | "ingredient.delete"
  | "ingredient.merge"
  | "request.approve"
  | "request.reject"
  | "report.review"
  | "report.close"
  | "admin.login";

export async function logAudit(params: {
  adminId: number;
  action: AuditAction;
  entityType: string;
  entityId?: number;
  details?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? 0,
        details: params.details,
      },
    });
  } catch (error) {
    // Audit logging should never break the main operation
    console.error("Failed to write audit log:", error);
  }
}
