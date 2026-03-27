import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Samagra Enterprises — Solar Solutions India',
  description:
    'Samagra Enterprises delivers solar products, EPC services, consultation, and renewable energy solutions across India.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
