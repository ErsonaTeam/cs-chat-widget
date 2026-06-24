import type { Language } from '@/utils/i18n';

export type QuickActionId = 'availability' | 'prices' | 'packages';

export const ALL_QUICK_ACTIONS: QuickActionId[] = ['availability', 'prices', 'packages'];

export interface WidgetConfig {
  widgetId: string;
  hotelName: string | null;
  selectedTheme: string;
  enabledLanguages: Language[];
  defaultLanguage: Language;
  showLanguageSelector: boolean;
  logoUrl: string | null;
  backgroundImageUrl: string | null;
  quickActionsEnabled: boolean;
  enabledQuickActions: QuickActionId[];
  // Guest contact collection (SCRUM-1089)
  showEmail: boolean;
  emailRequired: boolean;
  showPhone: boolean;
  phoneRequired: boolean;
}

export const DEFAULT_WIDGET_CONFIG: Omit<WidgetConfig, 'widgetId'> = {
  hotelName: null,
  selectedTheme: 'urban',
  enabledLanguages: ['HE', 'EN'],
  defaultLanguage: 'HE',
  showLanguageSelector: true,
  logoUrl: null,
  backgroundImageUrl: null,
  quickActionsEnabled: true,
  enabledQuickActions: ['availability', 'prices', 'packages'],
  // Contact collection off by default → widgets with no config behave exactly as today (name only)
  showEmail: false,
  emailRequired: false,
  showPhone: false,
  phoneRequired: false,
};
