import { db } from "../db";
import { bakers, tenantProfiles } from "../../shared/schema";
import { eq } from "drizzle-orm";

export interface ResolvedTenant {
  id: string;
  slug: string;
  baker?: any;
  profile?: any;
}

/**
 * Resolve tenant by baker slug
 * Used for public routes: /p/:slug, /b/:slug/book, /calculator?tenant=:slug
 */
export async function resolveTenantBySlug(slug: string): Promise<ResolvedTenant | null> {
  try {
    // Find baker by slug
    const [baker] = await db
      .select()
      .from(bakers)
      .where(eq(bakers.slug, slug))
      .limit(1);

    if (!baker || !baker.tenantId) {
      return null;
    }

    // Get tenant profile to check if published
    const [profile] = await db
      .select()
      .from(tenantProfiles)
      .where(eq(tenantProfiles.tenantId, baker.tenantId))
      .limit(1);

    return {
      id: baker.tenantId,
      slug: baker.slug,
      baker,
      profile
    };
  } catch (error) {
    console.error('Error resolving tenant by slug:', error);
    return null;
  }
}
