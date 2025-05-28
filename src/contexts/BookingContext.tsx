"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { Booking, CupCategory, Gender, TimeSlotData } from '@/types';
import { format } from 'date-fns';

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => Promise<boolean>;
  isSlotBooked: (date: Date, startTime: string, endTime: string) => boolean;
  getAvailableTimeSlots: (date: Date, durationHours: number) => TimeSlotData[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Mock bookings data
const MOCK_BOOKINGS: Booking[] = [
  // Example booking for tomorrow if you want to test
  // {
  //   id: 'mock1',
  //   date: new Date(new Date().setDate(new Date().getDate() + 1)),
  //   startTime: '14:00',
  //   endTime: '16:00',
  //   gender: 'men',
  //   cupCategory: { id: '10cups', labelKey: 'cat10cups', cups: 10, durationHours: 2 },
  //   customerName: 'John Doe',
  //   customerPhone: '1234567890',
  //   address: '123 Mock St',
  //   zone: 'A1',
  //   street: 'Mock Street',
  //   buildingNumber: 'B2',
  //   agreementFileName: 'signed.pdf'
  // }
];


export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const addBooking = useCallback(async (newBookingData: Omit<Booking, 'id'>): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newBooking: Booking = {
      ...newBookingData,
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setBookings((prevBookings) => [...prevBookings, newBooking]);
    return true; // Simulate success
  }, []);

  const isSlotBooked = useCallback((date: Date, startTime: string, endTime: string): boolean => {
    return bookings.some(booking =>
      format(booking.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
      ((booking.startTime < endTime && booking.endTime > startTime)) // Check for overlap
    );
  }, [bookings]);

  const getAvailableTimeSlots = useCallback((date: Date, durationHours: number): TimeSlotData[] => {
    const availableSlots: TimeSlotData[] = [];
    const openingTime = 10; // 10 AM
    const closingTime = 22; // 10 PM

    for (let hour = openingTime; hour < closingTime; hour++) {
      const slotStartHour = hour;
      const slotEndHour = hour + durationHours;

      if (slotEndHour > closingTime) continue; // Slot extends beyond closing time

      const startTime = `${String(slotStartHour).padStart(2, '0')}:00`;
      const endTime = `${String(slotEndHour).padStart(2, '0')}:00`;
      
      if (!isSlotBooked(date, startTime, endTime)) {
        availableSlots.push({ startTime, endTime });
      }
    }
    return availableSlots;
  }, [isSlotBooked]);


  return (
    <BookingContext.Provider value={{ bookings, addBooking, isSlotBooked, getAvailableTimeSlots }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
