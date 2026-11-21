'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn('resend', {
        email,
        callbackUrl: '/admin',
        redirect: true,
      });

      if (res?.error) {
        setError('Failed to send magic link. Please check the email and try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Sign in to MasjidOS"
          description="Enter your email to receive an instant, secure magic link."
        />
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="email-input"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="committee@yourmasjid.org"
            required
            autoComplete="email"
            error={error || undefined}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Send Magic Link
          </Button>

          <p className="text-center text-xs text-slate-500 mt-4">
            No password required. We will email you a secure one-click link.
          </p>
        </form>
      </Card>
    </main>
  );
}
