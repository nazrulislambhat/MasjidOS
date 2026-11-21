import { z } from 'zod';
import { isSlugAvailable } from '../utils/slug';

export const calculationMethods = [
  'MuslimWorldLeague',
  'NorthAmerica',
  'Egyptian',
  'UmmAlQura',
  'Gulf',
  'Kuwait',
  'Qatar',
  'Singapore',
  'Karachi',
  'Tehran',
  'Turkey',
  'MoonsightingCommittee',
  'Dubai',
] as const;

export const madhabs = ['shafi', 'hanafi'] as const;

export const highLatitudeRules = [
  'MiddleOfTheNight',
  'SeventhOfTheNight',
  'TwilightAngle',
] as const;

export const createMasjidSchema = z.object({
  name: z.string().min(2, 'Masjid name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50)
    .refine((val) => isSlugAvailable(val).valid, {
      message: 'Slug is invalid or reserved',
    }),
  address: z.string().min(5, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1, 'Timezone is required'),
  calculationMethod: z.enum(calculationMethods).default('MuslimWorldLeague'),
  madhab: z.enum(madhabs).default('shafi'),
  highLatitudeRule: z.enum(highLatitudeRules).default('MiddleOfTheNight'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateMasjidInput = z.infer<typeof createMasjidSchema>;

export const updateMasjidProfileSchema = createMasjidSchema.partial().omit({ slug: true });
export type UpdateMasjidProfileInput = z.infer<typeof updateMasjidProfileSchema>;
