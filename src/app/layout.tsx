import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AppHeader from '@/components/AppHeader';
import FooterContent from '@/components/FooterContent'; // Import the new client component

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'LA VIE',
  description: 'Your LA VIE Experience',
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
             <FooterContent />
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
