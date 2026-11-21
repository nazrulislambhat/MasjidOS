import { auth } from './index';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { masjidMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    redirect('/login');
  }
  return user;
}

/**
 * Ensures the logged-in user is an active member (owner or admin) of the given masjid.
 */
export async function requireTenantMember(masjidId: string) {
  const user = await requireUser();
  const membership = await db
    .select()
    .from(masjidMembers)
    .where(and(eq(masjidMembers.masjidId, masjidId), eq(masjidMembers.userId, user.id)))
    .limit(1);

  if (!membership[0]) {
    redirect('/onboarding');
  }

  return {
    user,
    role: membership[0].role as 'owner' | 'admin',
    masjidId,
  };
}
