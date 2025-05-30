
import type { z } from 'zod';
import type { bookingFormSchema } from '@/lib/schemas';

export type Language = 'en' | 'ar';

export type Gender = 'men' | 'women';

export interface CupCategory {
  id: string;
  labelKey: string;
  cups: number; // For ice cream, this could represent servings or a standard package size
  durationHours: number;
  womenOnly?: boolean;
  unitKey?: string; // e.g., 'servingsLabel' or 'scoopsLabel'
}

export interface TimeSlotData {
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string; // Firestore document ID
  date: Date; // JS Date object (converted from Firestore Timestamp)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  gender: Gender;
  cupCategory: CupCategory;
  customerName: string;
  customerPhone: string;
  address: string;
  zone: string;
  street: string;
  buildingNumber: string;
  unitNumber?: string;
  googleMapsLink?: string;
  agreementFileName: string;
  agreementFileUrl: string;  // URL to view/download from Storage
  agreementFilePath: string; // Path in Firebase Storage, e.g., agreements/bookingId/fileName.pdf
  createdAt?: Date; // JS Date object (converted from Firestore Timestamp)
}

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export interface Translations {
  [key: string]: string | Translations;
}

export interface AllTranslations {
  en: Translations;
  ar: Translations;
}
