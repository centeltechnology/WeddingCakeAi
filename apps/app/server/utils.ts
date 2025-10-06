/**
 * Utility functions for the server
 */

/**
 * Generates a URL-friendly slug from a string
 * Example: "Sweet Treats Bakery" -> "sweet-treats-bakery"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-');
}

/**
 * Generates a unique slug by appending a number if the base slug exists
 */
export async function generateUniqueSlug(
  baseName: string, 
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = generateSlug(baseName);
  let counter = 1;
  
  // Keep adding numbers until we find a unique slug
  while (await checkExists(slug)) {
    slug = `${generateSlug(baseName)}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Checks if a string is a UUID (used to determine if we're dealing with ID vs slug)
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}