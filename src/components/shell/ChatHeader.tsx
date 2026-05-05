'use client';

import { type ReactNode } from 'react';
import Image from 'next/image';
import DefaultIcon from './DefaultIcon';
import type { WidgetTheme } from '@/config/theme-config';
import type { Language } from '@/utils/i18n';

interface ChatHeaderProps {
  theme: WidgetTheme;
  hotelName: string | null;
  logoUrl: string | null;
  lang: Language;
  onReset?: () => void;
  /** Slot for the LanguageSelector (placed opposite the title/logo block) */
  rightSlot?: ReactNode;
}

export default function ChatHeader({
  theme,
  hotelName,
  logoUrl,
  lang,
  onReset,
  rightSlot,
}: ChatHeaderProps) {
  const effectiveLogo = logoUrl ?? theme.logoUrl;
  const title = hotelName ?? theme.text[lang].headerTitle;

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
      <div className="flex items-center gap-2.5 min-w-0">
        {effectiveLogo ? (
          <Image
            src={effectiveLogo}
            alt=""
            width={theme.logoSize.width}
            height={theme.logoSize.height}
            className="rounded-md object-contain shrink-0"
          />
        ) : (
          <div className="shrink-0 w-7 h-7 rounded-full bg-primary text-surface flex items-center justify-center">
            <DefaultIcon size={16} />
          </div>
        )}
        <span className="text-sm font-semibold text-text truncate">{title}</span>
      </div>

      <div className="flex items-center gap-1">
        {rightSlot}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-text/60 hover:text-text px-2 py-1 rounded-md hover:bg-text/5"
          >
            {theme.text[lang].resetButton}
          </button>
        )}
      </div>
    </header>
  );
}
