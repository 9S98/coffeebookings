"use client";

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionWrapperProps {
  titleKey: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function SectionWrapper({ titleKey, children, className, icon }: SectionWrapperProps) {
  const { t } = useLanguage();

  return (
    <Card className={cn('mb-8 shadow-lg', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-primary">
          {icon}
          {t(titleKey)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
