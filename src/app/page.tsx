import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-lg" aria-hidden="true">
              M
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">MasjidOS</span>
          </div>
          <nav aria-label="Main Navigation">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Admin Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-6">
            ✨ Multi-Tenant Masjid Operating System
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            A simple, modern website & TV display for your Masjid.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
            Give your congregants accurate local prayer times, automated iqamah countdowns, community announcements, and one-tap donations. Built specifically for volunteer committees.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Get Started for Your Masjid
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Committee Sign In
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-4 font-bold" aria-hidden="true">
                🕌
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Calculated Prayer Times</h2>
              <p className="mt-2 text-sm text-slate-600">
                100% local calculations via Adhan.js. Set offsets or fixed times for Iqamah, with multiple Jumu&apos;ah slots.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-4 font-bold" aria-hidden="true">
                📺
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Unattended TV Display</h2>
              <p className="mt-2 text-sm text-slate-600">
                High-contrast display at <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/m/[slug]/display</code> that runs for weeks with auto-recovery and offline caching.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-4 font-bold" aria-hidden="true">
                📲
              </div>
              <h2 className="text-lg font-semibold text-slate-900">WhatsApp Share Tools</h2>
              <p className="mt-2 text-sm text-slate-600">
                One-tap formatted text copy of prayer schedules and announcements ready for WhatsApp broadcasts.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} MasjidOS. Production-grade open SaaS.
      </footer>
    </div>
  );
}
