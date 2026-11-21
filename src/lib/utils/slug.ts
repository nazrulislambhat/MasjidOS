export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'auth',
  'login',
  'onboarding',
  'm',
  'app',
  'static',
  'assets',
  'public',
  'support',
  'terms',
  'privacy',
  'settings',
  'display',
  'dashboard',
  'donate',
  'events',
  'announcements',
  'prayer-times',
]);

/**
 * Sanitizes an input string into a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Validates whether a slug is structurally sound and not a reserved word
 */
export function isSlugAvailable(slug: string): { valid: boolean; reason?: string } {
  const normalized = slug.toLowerCase().trim();
  if (RESERVED_SLUGS.has(normalized)) {
    return { valid: false, reason: `"${normalized}" is a reserved system path` };
  }
  if (normalized.length < 3) {
    return { valid: false, reason: 'Slug must be at least 3 characters long' };
  }
  if (normalized.length > 50) {
    return { valid: false, reason: 'Slug must not exceed 50 characters' };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    return { valid: false, reason: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }
  return { valid: true };
}
