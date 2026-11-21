import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MasjidOS — All-in-One Masjid Platform',
  description:
    'A multi-tenant platform for masjids: public website, automated prayer times, TV display screen, and simplified admin dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-emerald-700 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
