"use client";

import type { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { BookingProvider } from '@/contexts/BookingContext';
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <BookingProvider>
        {children}
        <Toaster />
      </BookingProvider>
    </LanguageProvider>
  );
}
