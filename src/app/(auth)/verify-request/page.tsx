import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/card';

export default function VerifyRequestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl" aria-hidden="true">
          ✉️
        </div>
        <CardHeader
          title="Check Your Email"
          description="A sign-in link has been sent to your email address. Click the link in your email to sign in."
        />
        <div className="mt-6 border-t border-slate-100 pt-4">
          <Link
            href="/login"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            &larr; Back to sign in
          </Link>
        </div>
      </Card>
    </main>
  );
}
