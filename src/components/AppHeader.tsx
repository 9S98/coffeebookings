"use client";

import Link from 'next/link';
import { Coffee, Cog, Home, Sun } from 'lucide-react'; // Using Sun as a placeholder for LA VIE logo idea
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
          {/* <Sun className="h-7 w-7" /> Replaced Coffee with Sun, or use a generic logo */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/><path d="M12 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/></svg>
          <span>LA VIE</span>
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
