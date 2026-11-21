import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { getUserMasjids, createTenantDal } from '@/db/dal';
import { Card, CardHeader } from '@/components/ui/card';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user?.id) return null;

  const userMasjids = await getUserMasjids(user.id);
  const currentMasjid = userMasjids[0]?.masjid;
  if (!currentMasjid) return null;

  const dal = createTenantDal(currentMasjid.id);
  const prayerConfig = await dal.prayerSettings.get();
  const announcementsList = await dal.announcements.listAll();
  const eventsList = await dal.events.listAll();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {user.name || user.email?.split('@')[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Managing <strong className="text-slate-800">{currentMasjid.name}</strong> ({currentMasjid.address})
        </p>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Public Website</div>
          <div className="mt-2 text-xl font-bold text-slate-900 truncate">
            /m/{currentMasjid.slug}
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Online & Statically Cached</p>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Calculation Method</div>
          <div className="mt-2 text-xl font-bold text-slate-900 truncate">
            {currentMasjid.calculationMethod}
          </div>
          <p className="mt-1 text-xs text-slate-500">Madhab: {currentMasjid.madhab}</p>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Announcements</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {announcementsList.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">Shown on public page & TV</p>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scheduled Events</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {eventsList.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">Upcoming community programs</p>
        </Card>
      </div>

      {/* Quick Action Hub for Volunteer Committee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="🕌 Prayer Times & Iqamah Settings"
            description="Manage iqamah offsets, fixed times, Jumu'ah slots, and Ramadan overrides."
          />
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 flex justify-between items-center">
              <span>Fajr: {prayerConfig?.fajrValue} {prayerConfig?.fajrType === 'offset' ? 'min after adhan' : ''}</span>
              <span>Maghrib: {prayerConfig?.maghribValue} {prayerConfig?.maghribType === 'offset' ? 'min after adhan' : ''}</span>
            </div>
            <Link
              href="/admin/prayer-times"
              className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Update Iqamah & Jumu&apos;ah Times
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="📺 TV Screen Display"
            description="Launch the high-contrast display designed for hallway and prayer hall TVs."
          />
          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Open on any smart TV or mini PC connected to a display screen. Automatically reloads on schedule and runs unattended with offline caching.
            </p>
            <Link
              href={`/m/${currentMasjid.slug}/display`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Open TV Display Screen ↗
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
