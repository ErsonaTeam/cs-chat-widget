'use client';

import { useEffect, type ReactNode } from 'react';
import BackgroundImage from './BackgroundImage';
import { applyThemeToDocument } from '@/config/apply-theme';
import type { WidgetTheme } from '@/config/theme-config';

interface WidgetShellProps {
  theme: WidgetTheme;
  /** When true, renders the BackgroundImage layer (welcome screen only) */
  showBackground: boolean;
  backgroundImageUrl: string | null;
  /** Direction applied to the outer wrapper for RTL/LTR layout */
  direction: 'ltr' | 'rtl';
  children: ReactNode;
}

export default function WidgetShell({
  theme,
  showBackground,
  backgroundImageUrl,
  direction,
  children,
}: WidgetShellProps) {
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme.id]);

  return (
    <div
      dir={direction}
      className="relative h-full w-full overflow-hidden bg-background"
    >
      {showBackground && (
        <BackgroundImage
          imageUrl={backgroundImageUrl}
          defaultTreatment={theme.defaultBackgroundTreatment}
          overlay
        />
      )}
      <div className="relative h-full w-full flex flex-col">{children}</div>
    </div>
  );
}
