# MasjidOS 🕌

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**MasjidOS** is a multi-tenant SaaS platform built to give every masjid a modern mobile-first public website, an unattended TV display screen, and an intuitive admin dashboard tailored for volunteer committees.

---

## ✨ Features (MVP Scope)

1. **Multi-Tenant Onboarding**:
   - Each masjid gets a dedicated public profile at `/m/[slug]`.
   - Automated geocoding via OpenStreetMap for coordinates and timezone lookup.
   - Calculation methods (Muslim World League, ISNA, Umm Al-Qura, Karachi, etc.) and Asr madhab options.
   - Strict reserved-word checking and slug conflict prevention.

2. **Automated Prayer Times Engine**:
   - Zero-dependency local calculations using `adhan-js`.
   - Configurable Iqamah offsets (e.g. Fajr +20 min) or fixed times (e.g. 13:15).
   - Support for multiple Jumu'ah khutbah slots.
   - Per-day manual overrides for Ramadan, Taraweeh, or special occasions.

3. **TV Display Mode (`/m/[slug]/display`)**:
   - High-contrast, full-screen layout designed for 1080p and 4K displays.
   - Auto-updating next prayer countdown and imminent Iqamah alerts.
   - Unattended resilience: zero memory leaks, daily 03:00 AM auto-reload, and offline fallback.

4. **Announcements & Events**:
   - Create, schedule, pin, and expire announcements.
   - Weekly recurring schedules (Halaqas, youth programs) and RSVP tracking.
   - One-tap "Copy for WhatsApp" formatted text generator.

5. **Donations & Campaigns**:
   - Configurable donation page with preset amounts ($10, $25, $50, $100, custom).
   - General operating fund and named campaign progress bars.
   - Stripe integration (Stripe Payment Links with metadata; extensible to Stripe Connect).
   - Webhook processing with automated email receipts via Resend.

6. **Accessibility & Performance**:
   - WCAG 2.1 AA compliant (keyboard navigation, visible focus, ARIA landmarks, contrast).
   - Statically cached public page with on-demand ISR revalidation on admin changes.
   - Mobile-first, Core Web Vitals target (LCP < 2.5s).

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js (App Router)** | Framework with React Server Components and Server Actions |
| **TypeScript (Strict)** | End-to-end type safety |
| **Tailwind CSS** | Styling, high-contrast TV modes, and accessible focus states |
| **Drizzle ORM** | Type-safe PostgreSQL ORM with automatic schema migrations |
| **PostgreSQL** | Relational multi-tenant database (hosted on Neon or Supabase) |
| **Auth.js (NextAuth v5)** | Passwordless email magic links with role-based access (`owner`, `admin`) |
| **Zod** | Runtime schema validation for every server action and API route |
| **Adhan.js** | Deterministic local prayer time and astronomical calculations |
| **Stripe** | Checkout sessions, Payment Links, and webhook handling |
| **Resend** | Transactional email delivery for magic links and donation receipts |
| **Vitest & Playwright** | Fast unit testing and end-to-end testing with axe-core a11y checks |

---

## 🏗️ Architecture & Multi-Tenancy

Every tenant table in MasjidOS contains a `masjid_id` foreign key. To prevent accidental data leaks across tenants, database operations are enforced through the **Tenant Data Access Layer (DAL)**:

```typescript
import { createTenantDal } from '@/db/dal';

// In server actions & admin routes:
const dal = createTenantDal(masjidId);
const settings = await dal.prayerSettings.get();
const announcements = await dal.announcements.listActive();
```

The factory guarantees compile-time and runtime validation: no query can run on tenant tables without a verified, non-empty `masjidId`.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ (v22 tested)
- **PostgreSQL**: A local PostgreSQL database, Supabase instance, or Neon serverless database.

### 2. Installation
```bash
git clone https://github.com/nazrulislambhat/MasjidOS.git
cd MasjidOS
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in the required credentials:
```env
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/masjidos

# Auth.js / NextAuth
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=generate_with_openssl_rand_base64_32

# Resend for Magic Link Email & Receipts
RESEND_API_KEY=re_your_api_key
EMAIL_FROM="MasjidOS <notifications@masjidos.org>"

# Stripe (MVP Payment Link & Webhooks)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup & Migration
Push the schema to your PostgreSQL database:
```bash
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

```bash
# Run TypeScript strict typecheck
npm run typecheck

# Run ESLint
npm run lint

# Run Unit Tests (Vitest)
npm run test

# Run End-to-End Tests (Playwright)
npm run test:e2e
```

---

## 🗺️ Route Directory

| Path | Description | Access |
|---|---|---|
| `/` | Landing page and platform directory | Public |
| `/login` | Passwordless magic link sign-in | Public |
| `/verify-request` | "Check your email" confirmation screen | Public |
| `/onboarding` | First-time masjid creation & address lookup | Authenticated |
| `/admin` | Volunteer-friendly administration dashboard | Admin / Owner |
| `/admin/prayer-times`| Iqamah offsets, fixed times, Jumu'ah slots, overrides | Admin / Owner |
| `/admin/announcements`| Announcement management and WhatsApp generator | Admin / Owner |
| `/admin/events` | Event calendar, recurrence, and RSVP count | Admin / Owner |
| `/admin/donations` | Campaign configuration and donation history | Admin / Owner |
| `/admin/settings` | Masjid metadata, calculation rules, logo | Admin / Owner |
| `/m/[slug]` | Public mobile-first masjid page (cached with ISR) | Public |
| `/m/[slug]/donate` | Dedicated campaign donation page | Public |
| `/m/[slug]/display` | Fullscreen unattended TV display screen | Public |

---

## 📋 Roadmap

See [TODO.md](TODO.md) for the complete phase-by-phase implementation plan and task checklist.

---

## 📄 License
MIT &copy; MasjidOS Contributors.
