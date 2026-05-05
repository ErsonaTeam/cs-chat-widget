'use client';

import { LuCalendarCheck, LuTag, LuGift } from 'react-icons/lu';
import type { ReactNode } from 'react';
import type { Language } from '@/utils/i18n';
import type { QuickActionId } from '@/config/widget-config';
import { getQuickActionLabel } from '@/config/quick-actions';

interface QuickActionsProps {
  enabled: QuickActionId[];
  lang: Language;
  variant: 'welcome' | 'chat';
  onSelect: (id: QuickActionId) => void;
}

const ICONS: Record<QuickActionId, ReactNode> = {
  availability: <LuCalendarCheck className="w-4 h-4" aria-hidden="true" />,
  prices: <LuTag className="w-4 h-4" aria-hidden="true" />,
  packages: <LuGift className="w-4 h-4" aria-hidden="true" />,
};

export default function QuickActions({
  enabled,
  lang,
  variant,
  onSelect,
}: QuickActionsProps) {
  if (enabled.length === 0) return null;

  if (variant === 'welcome') {
    // Center the group when fewer than 3 actions are enabled (otherwise the
    // 3-col grid leaves an empty cell that visually right/left-aligns the row).
    const colsClass =
      enabled.length === 1
        ? 'sm:grid-cols-1 sm:max-w-[12rem] sm:mx-auto'
        : enabled.length === 2
        ? 'sm:grid-cols-2 sm:max-w-[20rem] sm:mx-auto'
        : 'sm:grid-cols-3';

    return (
      <div className={`grid grid-cols-1 ${colsClass} gap-2`}>
        {enabled.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-surface hover:bg-accent-light transition-colors text-sm font-medium text-text"
          >
            {ICONS[id]}
            <span>{getQuickActionLabel(id, lang)}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {enabled.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-accent-light transition-colors text-xs font-medium text-text"
        >
          {ICONS[id]}
          <span>{getQuickActionLabel(id, lang)}</span>
        </button>
      ))}
    </div>
  );
}
