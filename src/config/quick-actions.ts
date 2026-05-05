import type { Language } from '@/utils/i18n';
import type { QuickActionId } from './widget-config';

export interface QuickActionMeta {
  id: QuickActionId;
  label: Record<Language, string>;
  /**
   * Prompt template per language. Supports `{start}` and `{end}` placeholders that
   * get substituted with the closest weekend dates at click time.
   */
  prompt: Record<Language, string>;
}

export const QUICK_ACTIONS: Record<QuickActionId, QuickActionMeta> = {
  availability: {
    id: 'availability',
    label: { HE: 'בדיקת זמינות', EN: 'Availability' },
    prompt: {
      HE: 'אשמח לבדוק זמינות לתאריכים {start} עד {end}',
      EN: "I'd like to check availability from {start} to {end}",
    },
  },
  prices: {
    id: 'prices',
    label: { HE: 'מחירים', EN: 'Prices' },
    prompt: {
      HE: 'מה המחירים לתאריכים {start} עד {end}?',
      EN: 'What are the prices for {start} to {end}?',
    },
  },
  packages: {
    id: 'packages',
    label: { HE: 'חבילות', EN: 'Packages' },
    prompt: {
      HE: 'אילו חבילות זמינות לתאריכים {start} עד {end}?',
      EN: 'What packages are available for {start} to {end}?',
    },
  },
};

/**
 * Returns the closest upcoming Thursday at midnight local time.
 * If today is Thursday, returns today. Otherwise returns the next Thursday.
 * Skips the current weekend if today is Fri/Sat/Sun (booking past dates makes no sense).
 */
function getClosestThursday(now: Date = new Date()): Date {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu, 6=Sat
  const daysToThursday = (4 - dayOfWeek + 7) % 7;
  today.setDate(today.getDate() + daysToThursday);
  return today;
}

/**
 * Format a date for display in the user-typed bubble.
 * HE: "16.5" (Israeli short form, no year). EN: "May 16".
 */
function formatWeekendDate(date: Date, lang: Language): string {
  if (lang === 'HE') {
    return `${date.getDate()}.${date.getMonth() + 1}`;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getQuickActionPrompt(id: QuickActionId, lang: Language): string {
  const start = getClosestThursday();
  const end = new Date(start);
  end.setDate(start.getDate() + 2); // Thu + 2 = Saturday (2-night stay)
  const startStr = formatWeekendDate(start, lang);
  const endStr = formatWeekendDate(end, lang);
  return QUICK_ACTIONS[id].prompt[lang]
    .replace('{start}', startStr)
    .replace('{end}', endStr);
}

export function getQuickActionLabel(id: QuickActionId, lang: Language): string {
  return QUICK_ACTIONS[id].label[lang];
}
