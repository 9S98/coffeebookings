"use client";

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { CalendarIcon, Users, Coffee, Clock, Phone, MapPin, Building, Home, Hash } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { useBooking } from '@/contexts/BookingContext';
import type { Booking } from '@/types';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const { language, t, dir } = useLanguage();
  const { bookings } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  const dateLocale = language === 'ar' ? arSA : enUS;

  const bookingsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return bookings
      .filter(booking => format(booking.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, bookings]);

  const bookedDays = useMemo(() => {
    const dates = bookings.map(booking => booking.date);
    return dates;
  }, [bookings]);


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary flex items-center gap-2">
        <CalendarIcon className="h-8 w-8" />
        {t('adminDashboard')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t('selectDate')}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={dateLocale}
                dir={dir}
                className="rounded-md border"
                modifiers={{ booked: bookedDays }}
                modifiersStyles={{ booked: { border: `2px solid hsl(var(--primary))`, borderRadius: 'var(--radius)' } }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-lg min-h-[400px]">
            <CardHeader>
              <CardTitle>
                {selectedDate ? t('bookingsForDate', { date: format(selectedDate, 'PPP', { locale: dateLocale }) }) : t('pickDate')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsForSelectedDate.length > 0 ? (
                <ul className="space-y-4">
                  {bookingsForSelectedDate.map(booking => (
                    <li key={booking.id}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                           <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg text-primary">
                                {booking.startTime} - {booking.endTime}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {t(booking.cupCategory.labelKey)} ({t('cupsLabel', {count: booking.cupCategory.cups})})
                              </CardDescription>
                            </div>
                            <Badge variant={booking.gender === 'men' ? "default" : "secondary"}>{t(booking.gender)}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <p className="text-sm text-muted-foreground mb-1"><strong>{t('name')}:</strong> {booking.customerName}</p>
                          <p className="text-sm text-muted-foreground mb-3"><strong>{t('phone')}:</strong> {booking.customerPhone}</p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setViewingBooking(booking)}>
                                {t('viewDetails')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[525px]" dir={dir}>
                              <DialogHeader>
                                <DialogTitle className="text-primary">{t('bookingDetails')}</DialogTitle>
                              </DialogHeader>
                              {viewingBooking && (
                                <div className="grid gap-4 py-4 text-sm">
                                  <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
                                    <Clock className="h-4 w-4 text-muted-foreground"/> <span><strong>{t('time')}:</strong> {viewingBooking.startTime} - {viewingBooking.endTime}</span>
                                    <Coffee className="h-4 w-4 text-muted-foreground"/><span><strong>{t('category')}:</strong> {t(viewingBooking.cupCategory.labelKey)} ({t('cupsLabel', {count: viewingBooking.cupCategory.cups})})</span>
                                    <Users className="h-4 w-4 text-muted-foreground"/><span><strong>{t('gender')}:</strong> {t(viewingBooking.gender)}</span>
                                  </div>
                                  <Separator />
                                  <h3 className="font-semibold mt-2">{t('customerDetails')}</h3>
                                  <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
                                    <Users className="h-4 w-4 text-muted-foreground"/><span><strong>{t('name')}:</strong> {viewingBooking.customerName}</span>
                                    <Phone className="h-4 w-4 text-muted-foreground"/><span><strong>{t('phone')}:</strong> {viewingBooking.customerPhone}</span>
                                  </div>
                                  <Separator />
                                  <h3 className="font-semibold mt-2">{t('address')}</h3>
                                   <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground"/><span>{viewingBooking.address}</span>
                                    <MapPin className="h-4 w-4 text-muted-foreground"/><span><strong>{t('zone')}:</strong> {viewingBooking.zone}</span>
                                    <Home className="h-4 w-4 text-muted-foreground"/><span><strong>{t('street')}:</strong> {viewingBooking.street}</span>
                                    <Building className="h-4 w-4 text-muted-foreground"/><span><strong>{t('buildingNumber')}:</strong> {viewingBooking.buildingNumber}</span>
                                    {viewingBooking.unitNumber && <><Hash className="h-4 w-4 text-muted-foreground"/><span><strong>{t('unitNumber')}:</strong> {viewingBooking.unitNumber}</span></>}
                                    {viewingBooking.googleMapsLink && <><MapPin className="h-4 w-4 text-muted-foreground" /><span><strong>{t('googleMapsLink')}:</strong> <a href={viewingBooking.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">{t('googleMapsLink')}</a></span></>}
                                  </div>
                                  <Separator />
                                  <p><strong>{t('agreement')}:</strong> {viewingBooking.agreementFileName || t('noFileChosen')}</p>
                                </div>
                              )}
                               <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                  {t('close')}
                                </Button>
                              </DialogClose>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-10">{t('noBookingsForDate')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
