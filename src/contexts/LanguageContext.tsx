"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Language, AllTranslations, Translations } from '@/types';
import { translations as appTranslations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const storedLang = localStorage.getItem('coffeeSpotLang') as Language | null;
    if (storedLang) {
      setLanguageState(storedLang);
      setDir(storedLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.lang = storedLang;
      document.body.className = storedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'en';
      document.body.className = 'ltr';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const newDir = lang === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    localStorage.setItem('coffeeSpotLang', lang);
    document.documentElement.lang = lang;
    document.body.className = newDir;
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let current: string | Translations | undefined = appTranslations[language];
    for (const k of keys) {
      if (typeof current === 'object' && current !== null && k in current) {
        current = current[k] as string | Translations;
      } else {
        return key; // Key not found
      }
    }
    
    let result = typeof current === 'string' ? current : key;

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        result = result.replace(new RegExp(`{${placeholder}}`, 'g'), String(replacements[placeholder]));
      });
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
