import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { db } from './index';
import {
  masjids,
  masjidMembers,
  prayerSettings,
  prayerOverrides,
  announcements,
  events,
  donationCampaigns,
  donations,
} from './schema';

/**
 * Tenant Data Access Layer (DAL)
 * Enforces that no query can run on tenant-scoped tables without a verified masjidId.
 */
export function createTenantDal(masjidId: string) {
  if (!masjidId || typeof masjidId !== 'string' || masjidId.trim() === '') {
    throw new Error('Tenant scoping violation: valid masjidId is strictly required.');
  }

  const tid = masjidId.trim();

  return {
    masjidId: tid,

    // Masjid Profile
    masjid: {
      get: async () => {
        const rows = await db.select().from(masjids).where(eq(masjids.id, tid)).limit(1);
        return rows[0] ?? null;
      },
      update: async (data: Partial<Omit<typeof masjids.$inferInsert, 'id' | 'createdAt'>>) => {
        const rows = await db
          .update(masjids)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(masjids.id, tid))
          .returning();
        return rows[0] ?? null;
      },
    },

    // Prayer Settings
    prayerSettings: {
      get: async () => {
        const rows = await db
          .select()
          .from(prayerSettings)
          .where(eq(prayerSettings.masjidId, tid))
          .limit(1);
        return rows[0] ?? null;
      },
      upsert: async (
        data: Omit<typeof prayerSettings.$inferInsert, 'masjidId' | 'updatedAt'>
      ) => {
        const rows = await db
          .insert(prayerSettings)
          .values({ ...data, masjidId: tid })
          .onConflictDoUpdate({
            target: prayerSettings.masjidId,
            set: { ...data, updatedAt: new Date() },
          })
          .returning();
        return rows[0];
      },
    },

    // Prayer Overrides (Per-day overrides)
    prayerOverrides: {
      getByDate: async (dateStr: string) => {
        const rows = await db
          .select()
          .from(prayerOverrides)
          .where(and(eq(prayerOverrides.masjidId, tid), eq(prayerOverrides.date, dateStr)))
          .limit(1);
        return rows[0] ?? null;
      },
      listByMonth: async (startDate: string, endDate: string) => {
        return db
          .select()
          .from(prayerOverrides)
          .where(
            and(
              eq(prayerOverrides.masjidId, tid),
              gte(prayerOverrides.date, startDate),
              lte(prayerOverrides.date, endDate)
            )
          )
          .orderBy(prayerOverrides.date);
      },
      upsert: async (
        data: Omit<typeof prayerOverrides.$inferInsert, 'id' | 'masjidId' | 'createdAt'>
      ) => {
        const rows = await db
          .insert(prayerOverrides)
          .values({ ...data, masjidId: tid })
          .onConflictDoUpdate({
            target: [prayerOverrides.masjidId, prayerOverrides.date],
            set: { ...data },
          })
          .returning();
        return rows[0];
      },
      delete: async (overrideId: string) => {
        return db
          .delete(prayerOverrides)
          .where(and(eq(prayerOverrides.masjidId, tid), eq(prayerOverrides.id, overrideId)));
      },
    },

    // Announcements
    announcements: {
      listActive: async (now: Date = new Date()) => {
        return db
          .select()
          .from(announcements)
          .where(
            and(
              eq(announcements.masjidId, tid),
              lte(announcements.startsAt, now)
            )
          )
          .orderBy(desc(announcements.isPinned), desc(announcements.startsAt));
      },
      listAll: async () => {
        return db
          .select()
          .from(announcements)
          .where(eq(announcements.masjidId, tid))
          .orderBy(desc(announcements.isPinned), desc(announcements.startsAt));
      },
      create: async (
        data: Omit<typeof announcements.$inferInsert, 'id' | 'masjidId' | 'createdAt' | 'updatedAt'>
      ) => {
        const rows = await db
          .insert(announcements)
          .values({ ...data, masjidId: tid })
          .returning();
        return rows[0];
      },
      update: async (
        id: string,
        data: Partial<Omit<typeof announcements.$inferInsert, 'id' | 'masjidId' | 'createdAt'>>
      ) => {
        const rows = await db
          .update(announcements)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(announcements.masjidId, tid), eq(announcements.id, id)))
          .returning();
        return rows[0] ?? null;
      },
      delete: async (id: string) => {
        return db
          .delete(announcements)
          .where(and(eq(announcements.masjidId, tid), eq(announcements.id, id)));
      },
    },

    // Events
    events: {
      listUpcoming: async (now: Date = new Date()) => {
        return db
          .select()
          .from(events)
          .where(and(eq(events.masjidId, tid), gte(events.startsAt, now)))
          .orderBy(events.startsAt);
      },
      listAll: async () => {
        return db
          .select()
          .from(events)
          .where(eq(events.masjidId, tid))
          .orderBy(desc(events.startsAt));
      },
      create: async (
        data: Omit<typeof events.$inferInsert, 'id' | 'masjidId' | 'createdAt' | 'updatedAt'>
      ) => {
        const rows = await db
          .insert(events)
          .values({ ...data, masjidId: tid })
          .returning();
        return rows[0];
      },
      update: async (
        id: string,
        data: Partial<Omit<typeof events.$inferInsert, 'id' | 'masjidId' | 'createdAt'>>
      ) => {
        const rows = await db
          .update(events)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(events.masjidId, tid), eq(events.id, id)))
          .returning();
        return rows[0] ?? null;
      },
      delete: async (id: string) => {
        return db
          .delete(events)
          .where(and(eq(events.masjidId, tid), eq(events.id, id)));
      },
      incrementRsvp: async (id: string) => {
        const rows = await db
          .select({ rsvpCount: events.rsvpCount })
          .from(events)
          .where(and(eq(events.masjidId, tid), eq(events.id, id)))
          .limit(1);
        if (!rows[0]) return null;
        const updated = await db
          .update(events)
          .set({ rsvpCount: rows[0].rsvpCount + 1, updatedAt: new Date() })
          .where(and(eq(events.masjidId, tid), eq(events.id, id)))
          .returning();
        return updated[0];
      },
    },

    // Campaigns & Donations
    donations: {
      listCampaigns: async (onlyActive = true) => {
        if (onlyActive) {
          return db
            .select()
            .from(donationCampaigns)
            .where(and(eq(donationCampaigns.masjidId, tid), eq(donationCampaigns.isActive, true)))
            .orderBy(desc(donationCampaigns.isGeneralFund), desc(donationCampaigns.createdAt));
        }
        return db
          .select()
          .from(donationCampaigns)
          .where(eq(donationCampaigns.masjidId, tid))
          .orderBy(desc(donationCampaigns.createdAt));
      },
      createCampaign: async (
        data: Omit<typeof donationCampaigns.$inferInsert, 'id' | 'masjidId' | 'createdAt' | 'updatedAt'>
      ) => {
        const rows = await db
          .insert(donationCampaigns)
          .values({ ...data, masjidId: tid })
          .returning();
        return rows[0];
      },
      listDonations: async (limit = 50) => {
        return db
          .select()
          .from(donations)
          .where(eq(donations.masjidId, tid))
          .orderBy(desc(donations.createdAt))
          .limit(limit);
      },
      recordDonation: async (
        data: Omit<typeof donations.$inferInsert, 'id' | 'masjidId' | 'createdAt'>
      ) => {
        const rows = await db
          .insert(donations)
          .values({ ...data, masjidId: tid })
          .returning();
        return rows[0];
      },
    },
  };
}

/**
 * Global helper to find a masjid by slug (for public page routing)
 */
export async function getMasjidBySlug(slug: string) {
  const normalized = slug.toLowerCase().trim();
  const rows = await db.select().from(masjids).where(eq(masjids.slug, normalized)).limit(1);
  return rows[0] ?? null;
}

/**
 * Global helper to find user's active masjid memberships
 */
export async function getUserMasjids(userId: string) {
  return db
    .select({
      masjid: masjids,
      role: masjidMembers.role,
    })
    .from(masjidMembers)
    .innerJoin(masjids, eq(masjids.id, masjidMembers.masjidId))
    .where(eq(masjidMembers.userId, userId));
}
