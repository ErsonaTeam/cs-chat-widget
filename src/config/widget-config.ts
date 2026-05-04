import type { Language } from '@/utils/i18n';

export type QuickActionId = 'availability' | 'prices' | 'packages';

export const ALL_QUICK_ACTIONS: QuickActionId[] = ['availability', 'prices', 'packages'];

export interface WidgetConfig {
  widgetId: string | null;
  companyId: string;
  hotelName: string | null;
  selectedTheme: string;
  enabledLanguages: Language[];
  defaultLanguage: Language;
  showLanguageSelector: boolean;
  logoUrl: string | null;
  backgroundImageUrl: string | null;
  quickActionsEnabled: boolean;
  enabledQuickActions: QuickActionId[];
}

export const DEFAULT_WIDGET_CONFIG: Omit<WidgetConfig, 'companyId'> = {
  widgetId: null,
  hotelName: null,
  selectedTheme: 'urban',
  enabledLanguages: ['HE', 'EN'],
  defaultLanguage: 'HE',
  showLanguageSelector: true,
  logoUrl: null,
  backgroundImageUrl: null,
  quickActionsEnabled: true,
  enabledQuickActions: ['availability', 'prices', 'packages'],
};
