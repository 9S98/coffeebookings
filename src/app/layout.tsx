import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a general-purpose font
import './globals.css';
import { Providers } from './providers';
import AppHeader from '@/components/AppHeader';

const inter = Inter({ subsets: ['latin', 'arabic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CoffeeSpot Booking',
  description: 'Book your coffee experience',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="py-6 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} CoffeeSpot Booking. All rights reserved.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
