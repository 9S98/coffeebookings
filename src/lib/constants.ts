
import type { CupCategory } from '@/types';

export const CUP_CATEGORIES: CupCategory[] = [
  { id: '10cups', labelKey: 'cat10cups', cups: 10, durationHours: 2 },
  { id: '20cups', labelKey: 'cat20cups', cups: 20, durationHours: 2 },
  { id: '30cups', labelKey: 'cat30cups', cups: 30, durationHours: 2 },
  { id: '50cups', labelKey: 'cat50cups', cups: 50, durationHours: 3 },
  { id: '80cups', labelKey: 'cat80cups', cups: 80, durationHours: 3 },
  { id: '100cups', labelKey: 'cat100cups', cups: 100, durationHours: 3 },
  { id: '150cups', labelKey: 'cat150cups', cups: 150, durationHours: 4 },
  { id: '300cups', labelKey: 'cat300cups', cups: 300, durationHours: 4 },
  { id: 'iceCreamServings', labelKey: 'catIceCreamServings', cups: 15, durationHours: 1, womenOnly: true, unitKey: 'servingsLabel' },
];

export const AGREEMENT_URL = "https://1drv.ms/b/c/62ab161b051030cd/IQTymTtxEyIxRKjqLnHYalCdAYwGseIO8w9UrZBdOvEiI9A";

export const BOOKING_HOURS_START = 10; // 10 AM
export const BOOKING_HOURS_END = 22;   // 10 PM
