
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect }
from 'react';
import type { Booking, TimeSlotData } from '@/types';
import { format } from 'date-fns';
import { db, storage } from '@/lib/firebase'; // User needs to create this file
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface BookingContextType {
  bookings: Booking[];
  addBooking: (
    bookingData: Omit<Booking, 'id' | 'agreementFileUrl' | 'agreementFilePath' | 'createdAt' | 'date' | 'agreementFileName'> & { date: Date, agreementFileName: string },
    agreementFile: File
  ) => Promise<boolean>;
  isSlotBooked: (date: Date, startTime: string, endTime: string) => boolean;
  getAvailableTimeSlots: (date: Date, durationHours: number) => TimeSlotData[];
  getBookingById: (id: string) => Promise<Booking | null>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const bookingsCollection = collection(db, 'bookings');
    const q = query(bookingsCollection, orderBy('date', 'desc'), orderBy('startTime', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedBookings: Booking[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedBookings.push({
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate(),
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : undefined,
        } as Booking);
      });
      setBookings(fetchedBookings);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addBooking = useCallback(async (
    bookingCoreData: Omit<Booking, 'id' | 'agreementFileUrl' | 'agreementFilePath' | 'createdAt' | 'date' | 'agreementFileName'> & { date: Date, agreementFileName: string },
    agreementFile: File
  ): Promise<boolean> => {
    try {
      // 1. Create a preliminary booking document to get an ID (optional, or generate client-side ID)
      // For simplicity, we'll let Firestore generate the ID upon addDoc.
      // This means the filePath won't include the bookingId before creation,
      // or we use a client-generated one for the path.
      // Let's use a temporary unique name for the file for now.
      const uniqueFileName = `${Date.now()}-${agreementFile.name}`;
      const filePath = `agreements/${uniqueFileName}`; // Simplified path, ideally use bookingId
      const storageRef = ref(storage, filePath);

      // 2. Upload the file
      const uploadResult = await uploadBytes(storageRef, agreementFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 3. Prepare the full booking document
      const bookingDocData = {
        ...bookingCoreData,
        date: Timestamp.fromDate(bookingCoreData.date), // Convert JS Date to Firestore Timestamp
        agreementFileName: agreementFile.name,
        agreementFileUrl: downloadUrl,
        agreementFilePath: uploadResult.metadata.fullPath, // Use the actual path from upload result
        createdAt: serverTimestamp(),
      };

      // 4. Add the document to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), bookingDocData);
      // If we wanted bookingId in the path, we'd update the filePath here and potentially move/rename the file or re-upload.
      // For now, the uniqueFileName approach is simpler.
      console.log("Booking added with ID: ", docRef.id);
      return true;
    } catch (error) {
      console.error("Error adding booking: ", error);
      return false;
    }
  }, []);


  const isSlotBooked = useCallback((date: Date, startTime: string, endTime: string): boolean => {
    if (loading) return true; // Assume booked while loading to prevent double booking
    return bookings.some(booking =>
      format(booking.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
      ((booking.startTime < endTime && booking.endTime > startTime)) // Check for overlap
    );
  }, [bookings, loading]);

  const getAvailableTimeSlots = useCallback((date: Date, durationHours: number): TimeSlotData[] => {
    const availableSlots: TimeSlotData[] = [];
    const openingTime = 10; // 10 AM
    const closingTime = 22; // 10 PM (last slot starts at 9 PM for 1h, 8 PM for 2h etc.)

    for (let hour = openingTime; hour < closingTime; hour++) {
      const slotStartHour = hour;
      const slotEndHour = hour + durationHours;

      if (slotEndHour > closingTime) continue;

      const startTime = `${String(slotStartHour).padStart(2, '0')}:00`;
      const endTime = `${String(slotEndHour).padStart(2, '0')}:00`;

      if (!isSlotBooked(date, startTime, endTime)) {
        availableSlots.push({ startTime, endTime });
      }
    }
    return availableSlots;
  }, [isSlotBooked]);

  const getBookingById = useCallback(async (id: string): Promise<Booking | null> => {
    try {
      const bookingDocRef = doc(db, 'bookings', id);
      const bookingDocSnap = await getDoc(bookingDocRef);
      if (bookingDocSnap.exists()) {
        const data = bookingDocSnap.data();
        return {
          id: bookingDocSnap.id,
          ...data,
          date: (data.date as Timestamp).toDate(),
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : undefined,
        } as Booking;
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching booking by ID:", error);
      return null;
    }
  }, []);


  return (
    <BookingContext.Provider value={{ bookings, addBooking, isSlotBooked, getAvailableTimeSlots, getBookingById }}>
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
