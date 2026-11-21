# MasjidOS — Engineering Roadmap & Implementation Tracker

A multi-tenant SaaS platform empowering masjids with a public mobile-first website, a TV display screen, and a volunteer-friendly admin dashboard.

---

## 📌 Implementation Status Overview

- [x] **Phase 0: Architecture, Schema & Route Map Design** *(Completed)*
- [x] **Phase 1: Project Scaffold, Auth, Tenancy Layer & Onboarding Flow** *(Completed)*
- [ ] **Phase 2: Prayer Times Engine & Iqamah Admin UI** *(Next Up)*
- [ ] **Phase 3: Announcements & Events (Admin + Public)**
- [ ] **Phase 4: Public Mobile-First Masjid Page (`/m/[slug]`)**
- [ ] **Phase 5: TV Display Mode (`/m/[slug]/display`)**
- [ ] **Phase 6: Stripe Donations, Webhooks & Email Receipts**
- [ ] **Phase 7: WhatsApp Share Tools, SEO, A11y Audit, Playwright E2E & Production Deployment**

---

## Detailed Phase Breakdown

### ✅ Phase 0: Architecture, DB Schema & Route Map
- [x] Propose folder structure separating public, auth, tenant `/m/[slug]`, TV `/display`, and `/admin`.
- [x] Define Drizzle ORM schema with strict `masjid_id` foreign keys and Auth.js tables.
- [x] Define Tenant Data Access Layer (DAL) strategy.
- [x] Establish route map and rendering strategy (Static, Dynamic, ISR).

---

### ✅ Phase 1: Project Scaffold, Auth, Tenancy & Onboarding
- [x] Next.js App Router, strict TypeScript (`tsconfig.json`), Tailwind CSS, PostCSS.
- [x] Drizzle ORM configuration with `postgres-js` for Supabase/Neon.
- [x] Auth.js (NextAuth v5) with Resend magic link provider and Drizzle adapter.
- [x] Multi-tenancy DAL (`createTenantDal(masjidId)`) with runtime and compile-time boundaries.
- [x] Slug generation, normalization, sanitization, and reserved system words protection (`src/lib/utils/slug.ts`).
- [x] Volunteer-friendly Onboarding flow (`/onboarding`):
  - Auto-generated slug with live validation preview.
  - Geocoding address lookup via OpenStreetMap Nominatim.
  - Calculation method, Asr madhab, and high-latitude rules.
  - Atomic database transaction creating Masjid, owner membership, default prayer settings, and default general campaign.
- [x] Admin dashboard skeleton at `/admin` with role indicators.
- [x] Automated test suite: Unit tests for slug validation and DAL boundary enforcement passing 100%.
- [x] Git repository initialized and pushed to remote `origin/main`.

---

### ⏳ Phase 2: Prayer Times Engine & Iqamah Admin UI
- [ ] **Adhan Calculation Engine (`src/lib/adhan/index.ts`)**:
  - Implement zero-dependency local calculation wrapper around `adhan` (adhan-js).
  - Map calculation methods: Muslim World League, ISNA (North America), Egyptian, Umm Al-Qura, Karachi, Moonsighting Committee, Dubai, etc.
  - Implement Asr madhab calculation (`shafi` vs `hanafi`).
  - Implement high-latitude adjustment rules (`MiddleOfTheNight`, `SeventhOfTheNight`, `TwilightAngle`).
  - Calculate daily prayer times: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha.
  - Compute Iqamah times dynamically based on masjid settings:
    - Offset mode: `adhan + offset_minutes` (e.g., Fajr +20 min, Maghrib +5 min).
    - Fixed mode: Explicit time string `HH:mm` (e.g., 06:00, 13:15).
  - Next prayer resolution and countdown calculation utility.
  - Gregorian to Hijri date conversion utility.
- [ ] **Prayer Overrides & DST Engine**:
  - Apply date-specific manual overrides (`prayer_overrides` table) for Ramadan, Taraweeh, or special days.
  - Handle daylight saving time (DST) shifts correctly via IANA timezone awareness.
- [ ] **Admin Prayer Times UI (`/admin/prayer-times`)**:
  - Accessible form for configuring Iqamah offsets and fixed times per prayer.
  - Configurable multiple Jumu'ah slots (Khutbah times and labels).
  - Calendar / date picker for adding, viewing, and clearing daily overrides.
  - Server actions with Zod validation for updating prayer settings.
- [ ] **Unit Tests (`src/tests/unit/adhan.test.ts`)**:
  - Verify prayer calculations against known reference coordinates (e.g., Makkah, London, New York).
  - Verify Hanafi vs. Shafi Asr calculation difference.
  - Verify high-latitude calculations for UK / Scandinavia summer nights.
  - Verify fixed vs. offset iqamah calculations.

---

### ⏳ Phase 3: Announcements & Events (Admin + Public)
- [ ] **Announcements Feature**:
  - Schema integration: title, content, optional image URL, pinned flag, publish date, expiration date.
  - Admin UI (`/admin/announcements`):
    - Create, edit, pin, unpin, and delete announcements.
    - Status badges: Active, Scheduled, Expired, Pinned.
  - "Copy for WhatsApp" button generating formatted plain text with emojis.
- [ ] **Events Feature**:
  - Schema integration: title, description, location, startsAt, endsAt, recurrence (`none`, `weekly`), RSVP flag, RSVP counter.
  - Admin UI (`/admin/events`):
    - Schedule one-time or weekly recurring events (e.g. weekly Halaqa).
    - Track and reset RSVP counts.
  - Public RSVP server action with rate-limiting / deduplication protection.
- [ ] Unit tests for announcement expiration filtering and recurring event expansions.

---

### ⏳ Phase 4: Public Mobile-First Masjid Page (`/m/[slug]`)
- [ ] **Public Page Architecture**:
  - Route: `/m/[slug]` statically rendered with ISR (`revalidate = 300`) and on-demand revalidation on admin mutations.
  - Mobile-first, responsive, accessible layout (WCAG 2.1 AA compliant).
  - Core Web Vitals optimization: Target LCP < 2.5s, zero CLS.
- [ ] **Components**:
  - **Masjid Header**: Logo, name, address with Google Maps / Apple Maps link.
  - **Today's Prayer Times Table**: Adhan and Iqamah times, highlight currently active prayer and next prayer.
  - **Live Next Prayer Countdown Widget**: Client-side countdown timer to next Adhan and Iqamah.
  - **Jumu'ah Schedule Card**: Multiple khutbah slots clearly displayed.
  - **Announcements Feed**: Pinned announcements first, expandable cards.
  - **Upcoming Events Calendar**: Dates, times, locations, and 1-tap RSVP button.
  - **Donate Quick Action Button**: Direct link to `/m/[slug]/donate`.
  - **Contact & Social Section**: Phone, email, website links with accessible labels.
- [ ] RTL layout support for Arabic / Urdu text readiness.

---

### ⏳ Phase 5: TV Display Mode (`/m/[slug]/display`)
- [ ] **TV Screen Architecture**:
  - Clean fullscreen layout with zero scrollbars, zero navigation chrome.
  - High-contrast color palette readable from 30+ feet across a prayer hall.
  - Built to run unattended for weeks without manual intervention:
    - Zero memory leaks (cleaned intervals, stable state).
    - Auto-reload heartbeat scheduled at 03:00 AM local time daily to pick up fresh deployments.
    - Resilient offline fallback using `localStorage` caching of current schedule.
    - Network reconnection auto-recovery.
- [ ] **Display Widgets**:
  - Current Gregorian and Hijri dates.
  - Big digital clock with seconds.
  - Prominent Current Prayer & Next Prayer badge with Iqamah countdown timer.
  - 5 Daily Prayers + Jumu'ah grid showing Adhan & Iqamah times.
  - Auto-scrolling / fading announcements carousel for community notices.
  - Visual Iqamah Alert mode (flashing/distinct screen state when Iqamah is imminent or in progress).

---

### ⏳ Phase 6: Stripe Donations, Webhooks & Email Receipts
- [ ] **Stripe Checkout Integration**:
  - Dedicated donation page at `/m/[slug]/donate`.
  - Configurable preset amounts ($10, $25, $50, $100, custom).
  - Support for One-time and Monthly recurring frequencies.
  - General Operating Fund vs. Named Campaigns (with goal progress bars).
  - Stripe Payment Links per masjid (with metadata `masjid_id`, `campaign_id`).
  - Architecture prepared for future Stripe Connect onboarding (`stripe_account_id`).
- [ ] **Stripe Webhook (`/api/webhooks/stripe`)**:
  - Verify Stripe webhook signature.
  - Record completed donations into the `donations` table.
  - Increment campaign `raisedAmountCents`.
- [ ] **Emailed Donation Receipts**:
  - Resend email template with tax-deductible masjid receipt, transaction ID, date, and amount.
  - Flag `receiptSentAt` in database.
- [ ] Admin donations overview at `/admin/donations` showing donor list, campaign goals, and total raised.

---

### ⏳ Phase 7: WhatsApp Share Tools, SEO, A11y, E2E & Deployment
- [ ] **WhatsApp Share Tools**:
  - One-tap "Copy Weekly Prayer Times for WhatsApp" with formatted monospace alignment.
  - One-tap "Copy Announcement for WhatsApp" with emoji headers and link.
- [ ] **SEO & Metadata**:
  - Dynamic OpenGraph and Twitter card image generation (`/m/[slug]/opengraph-image`).
  - Semantic JSON-LD schema for religious institutions.
- [ ] **Accessibility Audit (WCAG 2.1 AA)**:
  - Visible focus indicators across all interactive elements.
  - Contrast ratios verified (> 4.5:1 for normal text, > 3:1 for large text).
  - Screen reader testing (ARIA attributes, live regions for timers, semantic landmarks).
  - `prefers-reduced-motion` compliance.
- [ ] **Playwright End-to-End Test Suite**:
  - Flow 1: Onboarding flow (creation, slug validation, geocoding, dashboard redirect).
  - Flow 2: Prayer times adjustment and public page verification.
  - Flow 3: Donation flow / WhatsApp text copy.
  - Automated `@axe-core/playwright` accessibility check integrated into test suite.
- [ ] **Production Deployment Guide**:
  - Step-by-step instructions for deploying to Vercel with Neon / Supabase Postgres.
  - Database migration instructions (`drizzle-kit migrate`).
  - Webhook secret configuration and DNS setup.
