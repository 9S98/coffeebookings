import { z } from 'zod';

export const bookingFormSchema = z.object({
  name: z.string().min(1, { message: "fieldRequired" }),
  phone: z.string().min(7, { message: "invalidPhone" }).regex(/^[0-9+()-]*$/, { message: "invalidPhone"}), // Basic phone validation
  address: z.string().min(1, { message: "fieldRequired" }),
  zone: z.string().min(1, { message: "fieldRequired" }),
  street: z.string().min(1, { message: "fieldRequired" }),
  buildingNumber: z.string().min(1, { message: "fieldRequired" }),
  unitNumber: z.string().optional(),
  googleMapsLink: z.string().url({ message: "invalidUrl" }).optional().or(z.literal('')),
});

// We will handle file validation separately as Zod's file handling in React Hook Form can be tricky.
// For now, we'll just check if a file is selected.
