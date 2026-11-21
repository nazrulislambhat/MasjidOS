import { describe, it, expect } from 'vitest';
import { createTenantDal } from '@/db/dal';

describe('Tenant Data Access Layer (DAL) Scoping Violation Checks', () => {
  it('throws an immediate error if masjidId is empty string', () => {
    expect(() => createTenantDal('')).toThrowError(/Tenant scoping violation/);
  });

  it('throws an immediate error if masjidId is whitespace only', () => {
    expect(() => createTenantDal('   ')).toThrowError(/Tenant scoping violation/);
  });

  it('throws an immediate error if masjidId is undefined or null', () => {
    // @ts-expect-error test runtime boundary
    expect(() => createTenantDal(undefined)).toThrowError(/Tenant scoping violation/);
    // @ts-expect-error test runtime boundary
    expect(() => createTenantDal(null)).toThrowError(/Tenant scoping violation/);
  });

  it('instantiates cleanly with a valid trimmed masjidId', () => {
    const dal = createTenantDal('  masjid-123-uuid  ');
    expect(dal.masjidId).toBe('masjid-123-uuid');
    expect(dal.masjid).toBeDefined();
    expect(dal.prayerSettings).toBeDefined();
    expect(dal.announcements).toBeDefined();
    expect(dal.events).toBeDefined();
    expect(dal.donations).toBeDefined();
  });
});
