import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  doublePrecision,
  date,
  jsonb,
  uniqueIndex,
  index,
  primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Auth.js Tables (Adapter Compliant) ---

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// --- Multi-Tenant Masjid & Membership ---

export const masjids = pgTable(
  'masjids',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    address: text('address').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    timezone: text('timezone').notNull(), // e.g. "America/New_York", "Europe/London"
    calculationMethod: text('calculation_method').notNull().default('MuslimWorldLeague'),
    madhab: text('madhab', { enum: ['shafi', 'hanafi'] }).notNull().default('shafi'),
    highLatitudeRule: text('high_latitude_rule', {
      enum: ['MiddleOfTheNight', 'SeventhOfTheNight', 'TwilightAngle'],
    }).notNull().default('MiddleOfTheNight'),
    logoUrl: text('logo_url'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    websiteUrl: text('website_url'),
    stripePaymentUrl: text('stripe_payment_url'),
    stripeAccountId: text('stripe_account_id'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('masjids_slug_idx').on(table.slug),
  })
);

export const masjidMembers = pgTable(
  'masjid_members',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    masjidId: text('masjid_id')
      .notNull()
      .references(() => masjids.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['owner', 'admin'] }).notNull().default('admin'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    masjidUserIdx: uniqueIndex('masjid_members_masjid_user_idx').on(table.masjidId, table.userId),
    masjidIdx: index('masjid_members_masjid_idx').on(table.masjidId),
    userIdx: index('masjid_members_user_idx').on(table.userId),
  })
);

// --- Prayer Settings & Overrides ---

export const prayerSettings = pgTable('prayer_settings', {
  masjidId: text('masjid_id')
    .primaryKey()
    .references(() => masjids.id, { onDelete: 'cascade' }),
  fajrType: text('fajr_type', { enum: ['offset', 'fixed'] }).notNull().default('offset'),
  fajrValue: text('fajr_value').notNull().default('20'),

  dhuhrType: text('dhuhr_type', { enum: ['offset', 'fixed'] }).notNull().default('offset'),
  dhuhrValue: text('dhuhr_value').notNull().default('15'),

  asrType: text('asr_type', { enum: ['offset', 'fixed'] }).notNull().default('offset'),
  asrValue: text('asr_value').notNull().default('15'),

  maghribType: text('maghrib_type', { enum: ['offset', 'fixed'] }).notNull().default('offset'),
  maghribValue: text('maghrib_value').notNull().default('5'),

  ishaType: text('isha_type', { enum: ['offset', 'fixed'] }).notNull().default('offset'),
  ishaValue: text('isha_value').notNull().default('15'),

  jumuahKhutbahs: jsonb('jumuah_khutbahs')
    .$type<Array<{ time: string; label?: string }>>()
    .notNull()
    .default([{ time: '13:00', label: "Jumu'ah" }]),

  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const prayerOverrides = pgTable(
  'prayer_overrides',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    masjidId: text('masjid_id')
      .notNull()
      .references(() => masjids.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    fajrAdhan: text('fajr_adhan'),
    fajrIqamah: text('fajr_iqamah'),
    dhuhrAdhan: text('dhuhr_adhan'),
    dhuhrIqamah: text('dhuhr_iqamah'),
    asrAdhan: text('asr_adhan'),
    asrIqamah: text('asr_iqamah'),
    maghribAdhan: text('maghrib_adhan'),
    maghribIqamah: text('maghrib_iqamah'),
    ishaAdhan: text('isha_adhan'),
    ishaIqamah: text('isha_iqamah'),
    note: text('note'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    masjidDateIdx: uniqueIndex('prayer_overrides_masjid_date_idx').on(table.masjidId, table.date),
  })
);

// --- Announcements ---

export const announcements = pgTable(
  'announcements',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    masjidId: text('masjid_id')
      .notNull()
      .references(() => masjids.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    imageUrl: text('image_url'),
    isPinned: boolean('is_pinned').notNull().default(false),
    startsAt: timestamp('starts_at', { mode: 'date' }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    masjidIdx: index('announcements_masjid_idx').on(table.masjidId),
    activeIdx: index('announcements_active_idx').on(table.masjidId, table.startsAt, table.expiresAt),
  })
);

// --- Events ---

export const events = pgTable(
  'events',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    masjidId: text('masjid_id')
      .notNull()
      .references(() => masjids.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    location: text('location'),
    startsAt: timestamp('starts_at', { mode: 'date' }).notNull(),
    endsAt: timestamp('ends_at', { mode: 'date' }),
    recurrenceRule: text('recurrence_rule', { enum: ['none', 'weekly'] }).notNull().default('none'),
    allowRsvp: boolean('allow_rsvp').notNull().default(false),
    rsvpCount: integer('rsvp_count').notNull().default(0),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    masjidIdx: index('events_masjid_idx').on(table.masjidId),
    startsAtIdx: index('events_starts_at_idx').on(table.masjidId, table.startsAt),
  })
);

// --- Donations & Campaigns ---

export const donationCampaigns = pgTable(
  'donation_campaigns',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    masjidId: text('masjid_id')
      .notNull()
      .references(() => masjids.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    goalAmountCents: integer('goal_amount_cents'),
    raisedAmountCents: integer('raised_amount_cents').notNull().default(0),
    isGeneralFund: boolean('is_general_fund').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    stripePaymentUrl: text('stripe_payment_url'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    masjidIdx: index('donation_campaigns_masjid_idx').on(table.masjidId),
  })
);

export const donations = pgTable(
  'donations',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    masjidId: text('masjid_id')
      .notNull()
      .references(() => masjids.id, { onDelete: 'cascade' }),
    campaignId: text('campaign_id').references(() => donationCampaigns.id, { onDelete: 'set null' }),
    amountCents: integer('amount_cents').notNull(),
    donorName: text('donor_name').notNull(),
    donorEmail: text('donor_email').notNull(),
    frequency: text('frequency', { enum: ['one_time', 'monthly'] }).notNull().default('one_time'),
    stripeSessionId: text('stripe_session_id').unique(),
    status: text('status', { enum: ['pending', 'completed', 'failed'] }).notNull().default('pending'),
    receiptSentAt: timestamp('receipt_sent_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    masjidIdx: index('donations_masjid_idx').on(table.masjidId),
    sessionIdx: uniqueIndex('donations_stripe_session_idx').on(table.stripeSessionId),
  })
);

// --- Relations ---

export const masjidsRelations = relations(masjids, ({ one, many }) => ({
  members: many(masjidMembers),
  prayerSettings: one(prayerSettings, {
    fields: [masjids.id],
    references: [prayerSettings.masjidId],
  }),
  prayerOverrides: many(prayerOverrides),
  announcements: many(announcements),
  events: many(events),
  campaigns: many(donationCampaigns),
  donations: many(donations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  masjidMemberships: many(masjidMembers),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const masjidMembersRelations = relations(masjidMembers, ({ one }) => ({
  masjid: one(masjids, {
    fields: [masjidMembers.masjidId],
    references: [masjids.id],
  }),
  user: one(users, {
    fields: [masjidMembers.userId],
    references: [users.id],
  }),
}));
