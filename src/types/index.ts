import type { z } from 'zod';
import type { bookingFormSchema } from '@/lib/schemas';

export type Language = 'en' | 'ar';

export type Gender = 'men' | 'women';

export interface CupCategory {
  id: string;
  labelKey: string;
  cups: number;
  durationHours: number; 
}

export interface TimeSlotData {
  startTime: string; 
  endTime: string; 
}

export interface Booking {
  id: string;
  date: Date;
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
  agreementFileName?: string;
}

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export interface Translations {
  [key: string]: string | Translations;
}

export interface AllTranslations {
  en: Translations;
  ar: Translations;
}
