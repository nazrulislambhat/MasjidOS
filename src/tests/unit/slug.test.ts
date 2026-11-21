import { describe, it, expect } from 'vitest';
import { slugify, isSlugAvailable, RESERVED_SLUGS } from '@/lib/utils/slug';

describe('slugify', () => {
  it('converts mixed case and spaces to lower-case hyphens', () => {
    expect(slugify('Islamic Center of Boston')).toBe('islamic-center-of-boston');
  });

  it('removes special characters and symbols', () => {
    expect(slugify("Masjid Al-Noor & Community! (123)")).toBe('masjid-al-noor-community-123');
  });

  it('collapses multiple hyphens and trims leading/trailing hyphens', () => {
    expect(slugify('--Dar-ul-Islam---')).toBe('dar-ul-islam');
  });
});

describe('isSlugAvailable', () => {
  it('accepts valid normal slugs', () => {
    expect(isSlugAvailable('masjid-bilal').valid).toBe(true);
    expect(isSlugAvailable('icb-cambridge-12').valid).toBe(true);
  });

  it('rejects slugs that are too short', () => {
    const result = isSlugAvailable('ab');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('at least 3 characters');
  });

  it('rejects slugs with invalid characters or bad formatting', () => {
    expect(isSlugAvailable('masjid_bilal').valid).toBe(false);
    expect(isSlugAvailable('-masjid').valid).toBe(false);
    expect(isSlugAvailable('masjid-').valid).toBe(false);
  });

  it('strictly rejects reserved slugs', () => {
    for (const reserved of Array.from(RESERVED_SLUGS)) {
      const result = isSlugAvailable(reserved);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('reserved system path');
    }
  });
});
