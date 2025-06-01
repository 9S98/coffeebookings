
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
    console.log("addBooking: Starting process...");
    try {
      const uniqueFileName = `${Date.now()}-${agreementFile.name}`;
      const filePath = `agreements/${uniqueFileName}`;
      const storageRef = ref(storage, filePath);

      console.log(`addBooking: Attempting to upload file ${agreementFile.name} to ${filePath}`);
      const uploadResult = await uploadBytes(storageRef, agreementFile);
      console.log("addBooking: File upload successful.", uploadResult);

      console.log("addBooking: Attempting to get download URL...");
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      console.log("addBooking: Got download URL: ", downloadUrl);

      const bookingDocData = {
        ...bookingCoreData,
        date: Timestamp.fromDate(bookingCoreData.date),
        agreementFileName: agreementFile.name,
        agreementFileUrl: downloadUrl,
        agreementFilePath: uploadResult.metadata.fullPath,
        createdAt: serverTimestamp(),
      };

      console.log("addBooking: Attempting to add document to Firestore with data:", bookingDocData);
      const docRef = await addDoc(collection(db, 'bookings'), bookingDocData);
      console.log("addBooking: Booking successfully added to Firestore with ID: ", docRef.id);
      return true;
    } catch (error) {
      console.error("addBooking: Error during booking process: ", error);
      return false;
    }
  }, []);


  const isSlotBooked = useCallback((date: Date, startTime: string, endTime: string): boolean => {
    if (loading) return true; 
    return bookings.some(booking =>
      format(booking.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
      ((booking.startTime < endTime && booking.endTime > startTime)) 
    );
  }, [bookings, loading]);

  const getAvailableTimeSlots = useCallback((date: Date, durationHours: number): TimeSlotData[] => {
    const availableSlots: TimeSlotData[] = [];
    const openingTime = 10; 
    const closingTime = 22; 

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
