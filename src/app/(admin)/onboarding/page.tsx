'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { slugify, isSlugAvailable } from '@/lib/utils/slug';
import { calculationMethods, madhabs, highLatitudeRules } from '@/lib/validations/masjid';
import { createMasjidAction } from '@/actions/masjid';

export default function OnboardingPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    calculationMethod: 'MuslimWorldLeague' as (typeof calculationMethods)[number],
    madhab: 'shafi' as (typeof madhabs)[number],
    highLatitudeRule: 'MiddleOfTheNight' as (typeof highLatitudeRules)[number],
    logoUrl: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
  });

  const [slugModified, setSlugModified] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: slugModified ? prev.slug : slugify(newName),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugModified(true);
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const slugStatus = isSlugAvailable(formData.slug);

  const handleAddressLookup = async () => {
    if (!formData.address || formData.address.length < 3) {
      setLookupMessage('Please enter a more complete address to lookup.');
      return;
    }

    setIsLookingUp(true);
    setLookupMessage(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.address
        )}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        // Approximate timezone from browser or offset if coordinates found
        const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          timezone: prev.timezone || localTz,
        }));
        setLookupMessage(`Location found: Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`);
      } else {
        setLookupMessage('Address not found. Please adjust or enter coordinates manually.');
      }
    } catch {
      setLookupMessage('Network lookup failed. Please enter coordinates manually.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!slugStatus.valid) {
      setErrorMessage(slugStatus.reason || 'Invalid slug');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createMasjidAction(formData);
      if (res.success && res.slug) {
        router.push(`/admin`);
      } else {
        setErrorMessage(res.error || 'Failed to create masjid');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-2xl shadow-sm" aria-hidden="true">
            M
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Setup Your Masjid on MasjidOS
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Tell us about your masjid. You will be able to customize prayer times and announcements next.
          </p>
        </div>

        <Card>
          <CardHeader
            title="Masjid Profile & Location"
            description="All fields can be updated later from the admin dashboard."
          />

          {errorMessage && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700" role="alert">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Masjid Name"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Islamic Cultural Center of Boston"
              />

              <div>
                <Input
                  label="Web Address Slug"
                  required
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="e.g. iccb"
                  error={formData.slug && !slugStatus.valid ? slugStatus.reason : undefined}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Your public link will be: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-medium">/m/{formData.slug || 'your-masjid'}</code>
                </p>
              </div>

              <div>
                <Input
                  label="Full Street Address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 100 Malcolm X Blvd, Roxbury, MA 02120"
                />
                <div className="mt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddressLookup}
                    isLoading={isLookingUp}
                  >
                    Auto-Detect Coordinates
                  </Button>
                  {lookupMessage && (
                    <span className="text-xs text-slate-600 font-medium" role="status">
                      {lookupMessage}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Timezone"
                  required
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  hint="e.g. America/New_York"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Prayer Calculation Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Calculation Method"
                  value={formData.calculationMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      calculationMethod: e.target.value as (typeof calculationMethods)[number],
                    })
                  }
                  options={calculationMethods.map((m) => ({ value: m, label: m }))}
                />

                <Select
                  label="Asr Calculation (Madhab)"
                  value={formData.madhab}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      madhab: e.target.value as (typeof madhabs)[number],
                    })
                  }
                  options={[
                    { value: 'shafi', label: 'Standard / Shafi / Maliki / Hanbali' },
                    { value: 'hanafi', label: 'Hanafi' },
                  ]}
                />
              </div>

              <div className="mt-4">
                <Select
                  label="High Latitude Rule"
                  value={formData.highLatitudeRule}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      highLatitudeRule: e.target.value as (typeof highLatitudeRules)[number],
                    })
                  }
                  options={highLatitudeRules.map((r) => ({ value: r, label: r }))}
                  hint="Used during summer months in high latitudes (e.g. UK, Canada, Scandinavia)"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Contact & Media (Optional)</h2>
              <div className="space-y-4">
                <Input
                  label="Logo Image URL"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="info@yourmasjid.org"
                  />
                  <Input
                    label="Contact Phone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={!slugStatus.valid}
              >
                Complete Setup & Go to Dashboard
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
