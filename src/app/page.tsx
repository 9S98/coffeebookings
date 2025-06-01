
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Coffee, CalendarDays, Info, FileText, MapPin, CheckCircle, AlertCircle, Clock, AlertTriangle, IceCream, Send } from 'lucide-react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';

import { useLanguage } from '@/contexts/LanguageContext';
import { useBooking } from '@/contexts/BookingContext';
import type { Gender, CupCategory, TimeSlotData, BookingFormData } from '@/types';
import { CUP_CATEGORIES, AGREEMENT_URL } from '@/lib/constants';
import { bookingFormSchema } from '@/lib/schemas';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SectionWrapper } from '@/components/shared/SectionWrapper';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

export default function BookingPage() {
  const { language, t, dir } = useLanguage();
  const { addBooking, getAvailableTimeSlots, isSlotBooked } = useBooking();
  const { toast } = useToast();

  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [wantsIceCream, setWantsIceCream] = useState<boolean | null>(null);
  const [selectedCupCategory, setSelectedCupCategory] = useState<CupCategory | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotData | null>(null);
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAgreementSection, setShowAgreementSection] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      zone: '',
      street: '',
      buildingNumber: '',
      unitNumber: '',
      googleMapsLink: '',
    },
  });

  useEffect(() => {
    setSelectedCupCategory(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setShowAgreementSection(false);
    if (selectedGender === 'men') {
      setWantsIceCream(null); 
    }
  }, [selectedGender]);

  useEffect(() => {
    if (selectedGender === 'women') {
      if (wantsIceCream === true) {
        const iceCreamCat = CUP_CATEGORIES.find(c => c.id === 'iceCreamServings');
        setSelectedCupCategory(iceCreamCat || null);
      } else if (wantsIceCream === false) {
         if (selectedCupCategory?.id === 'iceCreamServings') {
           setSelectedCupCategory(null); 
         }
      }
    } else {
      setWantsIceCream(null);
      if (selectedCupCategory?.id === 'iceCreamServings') {
        setSelectedCupCategory(null);
      }
    }
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setShowAgreementSection(false);
  }, [wantsIceCream, selectedGender, selectedCupCategory?.id]);


  useEffect(() => { 
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setShowAgreementSection(false);
  }, [selectedCupCategory]);

  useEffect(() => { 
    setSelectedTimeSlot(null);
    setShowAgreementSection(false);
  }, [selectedDate]);


  const filteredCupCategories = useMemo(() => {
    return CUP_CATEGORIES.filter(category => {
      if (category.id === 'iceCreamServings') return false; 
      if (selectedGender === 'men' && category.womenOnly) {
        return false;
      }
      return true;
    });
  }, [selectedGender]);

  const availableTimeSlots = useMemo(() => {
    if (selectedDate && selectedCupCategory) {
      return getAvailableTimeSlots(selectedDate, selectedCupCategory.durationHours);
    }
    return [];
  }, [selectedDate, selectedCupCategory, getAvailableTimeSlots]);

  const onSubmit: SubmitHandler<BookingFormData> = async (data) => {
    if (!selectedGender || !selectedCupCategory || !selectedDate || !selectedTimeSlot || !agreementFile) {
      toast({
        title: t('errorTitle'),
        description: t('fillRequiredFields'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const bookingCoreData = {
      customerName: data.name,
      customerPhone: data.phone,
      address: data.address,
      zone: data.zone,
      street: data.street,
      buildingNumber: data.buildingNumber,
      unitNumber: data.unitNumber,
      googleMapsLink: data.googleMapsLink,
      gender: selectedGender,
      cupCategory: selectedCupCategory,
      date: selectedDate,
      startTime: selectedTimeSlot.startTime,
      endTime: selectedTimeSlot.endTime,
      agreementFileName: agreementFile.name,
    };

    try {
      const success = await addBooking(bookingCoreData, agreementFile);
      if (success) {
        toast({
          title: t('bookingConfirmation'),
          description: t('bookingConfirmationMessage'),
          action: <CheckCircle className="text-green-500" />,
        });
        form.reset();
        setSelectedGender(null);
        setWantsIceCream(null);
        setSelectedCupCategory(null);
        setSelectedDate(undefined);
        setSelectedTimeSlot(null);
        setAgreementFile(null);
        setShowAgreementSection(false);
        const fileInput = document.getElementById('agreementFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          title: t('errorTitle'),
          description: t('bookingFailedMessage'),
          variant: "destructive",
          action: <AlertCircle className="text-red-500" />,
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: t('errorTitle'),
        description: t('bookingFailedMessage'),
        variant: "destructive",
        action: <AlertCircle className="text-red-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAgreementFile(event.target.files[0]);
    } else {
      setAgreementFile(null);
    }
  };
  
  const isProceedToAgreementDisabled = !form.formState.isValid;

  const isBookingButtonDisabled = !agreementFile || !form.formState.isValid || isSubmitting;

  const dateLocale = language === 'ar' ? arSA : enUS;


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center my-8">
        <h1 className="text-5xl font-bold text-primary">{t('appName')}</h1>
        <p className="text-xl text-muted-foreground mt-2">{t('pageSlogan')}</p>
        <p className="text-md text-muted-foreground">{t('pageLocation')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <SectionWrapper titleKey="selectGender" icon={<Users className="h-6 w-6" />}>
            <RadioGroup
              value={selectedGender || undefined}
              onValueChange={(value: Gender) => {
                setSelectedGender(value);
              }}
              className="flex gap-4"
              dir={dir}
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="men" id="men" />
                <Label htmlFor="men" className="text-lg">{t('men')}</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="women" id="women" />
                <Label htmlFor="women" className="text-lg">{t('women')}</Label>
              </div>
            </RadioGroup>
          </SectionWrapper>

          {selectedGender === 'women' && (
            <SectionWrapper titleKey="addIceCream" icon={<IceCream className="h-6 w-6" />}>
              <RadioGroup
                value={wantsIceCream === null ? "" : String(wantsIceCream)}
                onValueChange={(value: string) => {
                  setWantsIceCream(value === 'true');
                }}
                className="flex gap-4"
                dir={dir}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="true" id="iceCreamYes" />
                  <Label htmlFor="iceCreamYes" className="text-lg">{t('yes')}</Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="false" id="iceCreamNo" />
                  <Label htmlFor="iceCreamNo" className="text-lg">{t('no')}</Label>
                </div>
              </RadioGroup>
            </SectionWrapper>
          )}

          {selectedGender && (wantsIceCream !== null || selectedGender === 'men') && (
            <SectionWrapper titleKey="selectCupCategory" icon={<Coffee className="h-6 w-6" />}>
              {selectedGender === 'women' && wantsIceCream === true && selectedCupCategory?.id === 'iceCreamServings' ? (
                <div className="p-4 border rounded-md bg-secondary/30 dark:bg-secondary/20">
                  <h3 className="text-lg font-semibold text-primary">{t(selectedCupCategory.labelKey)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t('iceCreamPackageSelectedInfo')}</p>
                </div>
              ) : (
                (selectedGender === 'men' || (selectedGender === 'women' && wantsIceCream === false)) && filteredCupCategories.length > 0 && (
                  <RadioGroup
                    value={selectedCupCategory?.id || ""}
                    onValueChange={(value) => {
                      setSelectedCupCategory(filteredCupCategories.find(c => c.id === value) || null);
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                    dir={dir}
                  >
                    {filteredCupCategories.map(category => (
                      <div key={category.id}>
                        <RadioGroupItem value={category.id} id={category.id} className="sr-only" />
                        <Label
                          htmlFor={category.id}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer h-full",
                            selectedCupCategory?.id === category.id && "border-primary ring-2 ring-primary"
                          )}
                        >
                          <span className="font-semibold">{t(category.labelKey)}</span>
                          <span className="text-sm text-muted-foreground">
                            {category.unitKey ? t(category.unitKey, { count: category.cups }) : t('cupsLabel', { count: category.cups })}
                          </span>
                          <span className="text-xs text-muted-foreground">{t('durationLabel', { hours: category.durationHours })}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )
              )}
              {selectedGender === 'women' && wantsIceCream === false && filteredCupCategories.length === 0 && (
                 <p className="text-muted-foreground text-center">{t('noBookingsForDate')}</p>
              )}
            </SectionWrapper>
          )}


          {selectedCupCategory && ( 
            <SectionWrapper titleKey="selectDate" icon={<CalendarDays className="h-6 w-6" />}>
               <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                  locale={dateLocale}
                  dir={dir}
                  className="rounded-md border shadow-sm"
                />
              </div>
            </SectionWrapper>
          )}

          {selectedCupCategory && selectedDate && (
            <SectionWrapper titleKey="selectTimeSlot" icon={<Clock className="h-6 w-6" />}>
              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTimeSlots.map(slot => {
                    const isCurrentlyBooked = isSlotBooked(selectedDate, slot.startTime, slot.endTime);
                    return (
                    <Button
                      key={`${slot.startTime}-${slot.endTime}`}
                      type="button"
                      variant={selectedTimeSlot?.startTime === slot.startTime ? "default" : "outline"}
                      onClick={() => !isCurrentlyBooked && setSelectedTimeSlot(slot)}
                      disabled={isCurrentlyBooked}
                      className={cn(
                        "py-3 text-sm",
                        isCurrentlyBooked && "bg-muted text-muted-foreground line-through cursor-not-allowed"
                      )}
                    >
                      {isCurrentlyBooked ? t('booked') : `${slot.startTime} - ${slot.endTime}`}
                    </Button>
                  )})}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">{t('noBookingsForDate')}</p>
              )}
            </SectionWrapper>
          )}

          {selectedCupCategory && selectedDate && selectedTimeSlot && !showAgreementSection && (
            <>
              <SectionWrapper titleKey="customerDetails" icon={<Info className="h-6 w-6" />}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage>{form.formState.errors.name ? t(form.formState.errors.name.message as string) : null}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('phone')}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={t('phonePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage>{form.formState.errors.phone ? t(form.formState.errors.phone.message as string) : null}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('address')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('addressPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage>{form.formState.errors.address ? t(form.formState.errors.address.message as string) : null}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('zone')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('zonePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage>{form.formState.errors.zone ? t(form.formState.errors.zone.message as string) : null}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('street')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('streetPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage>{form.formState.errors.street ? t(form.formState.errors.street.message as string) : null}</FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="buildingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('buildingNumber')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('buildingNumberPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage>{form.formState.errors.buildingNumber ? t(form.formState.errors.buildingNumber.message as string) : null}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unitNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('unitNumber')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('unitNumberPlaceholder')} {...field} />
                          </FormControl>
                           <FormMessage>{form.formState.errors.unitNumber ? t(form.formState.errors.unitNumber.message as string) : null}</FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="googleMapsLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel><MapPin className="inline h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0"/>{t('googleMapsLink')}</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder={t('googleMapsLinkPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage>{form.formState.errors.googleMapsLink ? t(form.formState.errors.googleMapsLink.message as string) : null}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </SectionWrapper>

              <Button 
                type="button" 
                size="lg" 
                className="w-full text-lg" 
                onClick={() => setShowAgreementSection(true)}
                disabled={isProceedToAgreementDisabled}
              >
                <Send className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('proceedToAgreement')}
              </Button>
              {isProceedToAgreementDisabled && (
                <p className="text-sm text-destructive text-center mt-2">{t('fillCustomerDetailsPrompt')}</p>
              )}
            </>
          )}

          {showAgreementSection && (
            <>
              <SectionWrapper titleKey="agreement" icon={<FileText className="h-6 w-6" />}>
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('importantAgreementTitle')}</AlertTitle>
                  <AlertDescription>
                    {t('importantAgreementMessage')}
                  </AlertDescription>
                </Alert>
                <p className="mb-2 text-sm text-muted-foreground">{t('agreementInstructions')}</p>
                <div className="mb-4 p-2 border rounded-md" style={{ width: '100%', height: '150px' }}>
                  <iframe
                    src={AGREEMENT_URL}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="auto"
                    title="Agreement Document"
                  ></iframe>
                </div>
                <Button type="button" variant="outline" asChild className="mb-4">
                  <a href={AGREEMENT_URL} target="_blank" rel="noopener noreferrer">
                    {t('downloadAgreement')}
                  </a>
                </Button>

                <FormItem>
                  <FormLabel htmlFor="agreementFile">{t('uploadSignedAgreement')}</FormLabel>
                  <FormControl>
                    <Input
                      id="agreementFile"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 rtl:file:ml-4 rtl:file:mr-0"
                    />
                  </FormControl>
                  {agreementFile && <p className="text-sm mt-2 text-green-600"><CheckCircle className="inline h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />{t('agreementUploaded', {fileName: agreementFile.name})}</p>}
                  {!agreementFile && <p className="text-sm mt-2 text-muted-foreground">{t('noFileChosen')}</p>}
                </FormItem>
              </SectionWrapper>
              
              <p className="text-sm text-muted-foreground text-center mb-4">{t('paymentNotice')}</p>

              <Button type="submit" size="lg" className="w-full text-lg" disabled={isBookingButtonDisabled}>
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                ) : (
                 t('bookNow')
                )}
              </Button>
              {isBookingButtonDisabled && !isSubmitting && !agreementFile && (
                  <p className="text-sm text-destructive text-center mt-2">{t('fillRequiredFields')}</p>
              )}
            </>
          )}
        </form>
      </Form>
    </div>
  );
}

