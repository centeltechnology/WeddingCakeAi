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
    if (!slug || typeof slug !== 'string') {
      console.log('[tenantResolver] Empty or invalid slug provided:', slug);
      return null;
    }
    
    const trimmedSlug = slug.trim();
    console.log('[tenantResolver] Looking up baker by slug:', trimmedSlug);
    
    // Find baker by slug
    const [baker] = await db
      .select()
      .from(bakers)
      .where(eq(bakers.slug, trimmedSlug))
      .limit(1);

    console.log('[tenantResolver] Baker found:', baker ? `id=${baker.id}, tenantId=${baker.tenantId}` : 'NOT FOUND');

    if (!baker || !baker.tenantId) {
      return null;
    }

    // Get tenant profile (optional - table may not exist)
    let profile = null;
    try {
      const [profileResult] = await db
        .select()
        .from(tenantProfiles)
        .where(eq(tenantProfiles.tenantId, baker.tenantId))
        .limit(1);
      profile = profileResult;
    } catch (profileError: any) {
      // Table may not exist - this is OK, profile is optional
      if (profileError?.code !== '42P01') {
        console.warn('[tenantResolver] Error fetching profile (non-critical):', profileError.message);
      }
    }

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
