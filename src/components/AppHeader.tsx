"use client";

import Link from 'next/link';
import { Coffee, Cog, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AppHeader() {
  const { language, setLanguage, t, dir } = useLanguage();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Coffee className="h-7 w-7" />
          <span>{t('appName')}</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" passHref>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
              <Home className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t('navHome')}
            </Button>
          </Link>
          <Link href="/admin" passHref>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
              <Cog className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t('navAdmin')}
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-accent hover:text-accent-foreground">
                {t('language')}: {language === 'en' ? t('english') : t('arabic')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                {t('english')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ar')}>
                {t('arabic')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
