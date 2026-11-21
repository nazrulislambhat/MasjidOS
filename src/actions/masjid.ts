'use server';

import { db } from '@/db';
import { masjids, masjidMembers, prayerSettings, donationCampaigns } from '@/db/schema';
import { createMasjidSchema, type CreateMasjidInput } from '@/lib/validations/masjid';
import { isSlugAvailable } from '@/lib/utils/slug';
import { requireUser } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function createMasjidAction(input: CreateMasjidInput) {
  const user = await requireUser();

  // 1. Zod validation
  const parsed = createMasjidSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  const data = parsed.data;

  // 2. Slug check
  const slugCheck = isSlugAvailable(data.slug);
  if (!slugCheck.valid) {
    return { success: false, error: slugCheck.reason };
  }

  // 3. Database uniqueness check for slug
  const existing = await db
    .select({ id: masjids.id })
    .from(masjids)
    .where(eq(masjids.slug, data.slug.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: `The address slug "${data.slug}" is already taken.` };
  }

  // 4. Atomically create masjid, owner membership, default prayer settings, and general campaign
  try {
    const result = await db.transaction(async (tx) => {
      const [newMasjid] = await tx
        .insert(masjids)
        .values({
          name: data.name,
          slug: data.slug.toLowerCase(),
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          calculationMethod: data.calculationMethod,
          madhab: data.madhab,
          highLatitudeRule: data.highLatitudeRule,
          logoUrl: data.logoUrl || null,
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          websiteUrl: data.websiteUrl || null,
        })
        .returning();

      // Assign owner role
      await tx.insert(masjidMembers).values({
        masjidId: newMasjid.id,
        userId: user.id,
        role: 'owner',
      });

      // Initialize default prayer settings
      await tx.insert(prayerSettings).values({
        masjidId: newMasjid.id,
        fajrType: 'offset',
        fajrValue: '20',
        dhuhrType: 'offset',
        dhuhrValue: '15',
        asrType: 'offset',
        asrValue: '15',
        maghribType: 'offset',
        maghribValue: '5',
        ishaType: 'offset',
        ishaValue: '15',
        jumuahKhutbahs: [{ time: '13:00', label: "Jumu'ah" }],
      });

      // Initialize default General Fund donation campaign
      await tx.insert(donationCampaigns).values({
        masjidId: newMasjid.id,
        title: 'General Operating Fund',
        description: 'Support the daily maintenance, utilities, and community operations of our masjid.',
        isGeneralFund: true,
        isActive: true,
      });

      return newMasjid;
    });

    return { success: true, slug: result.slug, masjidId: result.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create masjid';
    return { success: false, error: message };
  }
}
