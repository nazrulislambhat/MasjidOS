import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getUserMasjids } from '@/db/dal';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    redirect('/login');
  }

  const userMasjids = await getUserMasjids(user.id);
  if (userMasjids.length === 0) {
    redirect('/onboarding');
  }

  const currentMasjid = userMasjids[0].masjid;
  const currentRole = userMasjids[0].role;

  const navItems = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/prayer-times', label: 'Prayer Times' },
    { href: '/admin/announcements', label: 'Announcements' },
    { href: '/admin/events', label: 'Events' },
    { href: '/admin/donations', label: 'Donations' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-base" aria-hidden="true">
                M
              </span>
              <span className="font-bold text-slate-900 hidden sm:inline">MasjidOS</span>
            </Link>

            <span className="text-slate-300" aria-hidden="true">/</span>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm max-w-[200px] truncate">
                {currentMasjid.name}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase border border-emerald-200">
                {currentRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/m/${currentMasjid.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
              title="View Public Page (opens in new tab)"
            >
              Public Page ↗
            </Link>
            <Link
              href={`/m/${currentMasjid.slug}/display`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 shadow-sm"
              title="Launch TV Display Mode (opens in new tab)"
            >
              TV Display ↗
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Admin Navigation"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto text-sm border-t border-slate-100"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-3 px-1 border-b-2 border-transparent font-medium text-slate-600 hover:text-emerald-600 hover:border-emerald-500 whitespace-nowrap transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        MasjidOS Admin &bull; {currentMasjid.name} &bull; <code className="bg-slate-100 px-1 py-0.5 rounded">/m/{currentMasjid.slug}</code>
      </footer>
    </div>
  );
}
