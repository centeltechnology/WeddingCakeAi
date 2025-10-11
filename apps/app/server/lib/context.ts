import type { Request } from "express";

export interface RequestContext {
  userId: string;
  tenantId: string | null;
}

export function getRequestContext(req: Request): RequestContext {
  const userId = (req.session as any)?.userId;
  const tenantId = (req.session as any)?.tenantId || null;

  if (!userId) {
    throw new Error("Unauthorized: No user session found");
  }

  return { userId, tenantId };
}

export function requireTenant(req: Request): { userId: string; tenantId: string } {
  const context = getRequestContext(req);
  
  if (!context.tenantId) {
    throw new Error("Unauthorized: No tenant context");
  }

  return { userId: context.userId, tenantId: context.tenantId };
}
