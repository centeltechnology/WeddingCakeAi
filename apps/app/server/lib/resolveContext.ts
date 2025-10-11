export async function resolveContext(req: any) {
  return {
    tenantId: req.tenant?.id ?? null,
    bakerId: req.user?.bakerId ?? null,
  };
}
