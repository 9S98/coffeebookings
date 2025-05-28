"use client";

import { useLanguage } from '@/contexts/LanguageContext';

export default function FooterContent() {
  const { t } = useLanguage();
  return (
    <>
      © {new Date().getFullYear()} LA VIE. {t('allRightsReserved')}.
      <div className="mt-2">
        {t('contactUs')}: 77253077 - 59976633
      </div>
    </>
  );
}
