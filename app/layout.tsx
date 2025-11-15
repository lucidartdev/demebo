import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className="bg-gray-50 min-h-screen p-6">
        <main className="max-w-3xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
