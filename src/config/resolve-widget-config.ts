import {
  type WidgetConfig,
  type QuickActionId,
  ALL_QUICK_ACTIONS,
  DEFAULT_WIDGET_CONFIG,
} from './widget-config';
import type { Language } from '@/utils/i18n';

// Fetches widget configuration from the chat service by widgetId.
// Falls back to safe defaults on any failure so the widget always renders.

const VALID_LANGUAGES: Language[] = ['HE', 'EN'];
const VALID_QUICK_ACTIONS = new Set<QuickActionId>(ALL_QUICK_ACTIONS);
const FALLBACK_WIDGET_ID = 'default';

interface WidgetConfigResponse {
  widgetId: string;
  selectedTheme: string;
  hotelName: string | null;
  logoUrl: string | null;
  backgroundImageUrl: string | null;
  enabledLanguages: string[];
  defaultLanguage: string;
  showLanguageSelector: boolean;
  quickActionsEnabled: boolean;
  enabledQuickActions: string[];
}

function defaultsForWidgetId(widgetId: string): WidgetConfig {
  return {
    ...DEFAULT_WIDGET_CONFIG,
    widgetId,
  };
}

function normalizeLanguages(raw: string[]): Language[] {
  const filtered = raw
    .map((l) => l.toUpperCase())
    .filter((l): l is Language => VALID_LANGUAGES.includes(l as Language));
  return filtered.length > 0 ? filtered : ['HE', 'EN'];
}

function normalizeQuickActions(raw: string[]): QuickActionId[] {
  const filtered = raw.filter((qa): qa is QuickActionId =>
    VALID_QUICK_ACTIONS.has(qa as QuickActionId)
  );
  return filtered.length > 0 ? filtered : [...ALL_QUICK_ACTIONS];
}

function fromResponse(res: WidgetConfigResponse): WidgetConfig {
  const enabledLanguages = normalizeLanguages(res.enabledLanguages);
  const defaultLanguage = enabledLanguages.includes(
    res.defaultLanguage.toUpperCase() as Language
  )
    ? (res.defaultLanguage.toUpperCase() as Language)
    : enabledLanguages[0];

  const config: WidgetConfig = {
    widgetId: res.widgetId,
    hotelName: res.hotelName,
    selectedTheme: res.selectedTheme,
    enabledLanguages,
    defaultLanguage,
    showLanguageSelector: res.showLanguageSelector,
    logoUrl: res.logoUrl,
    backgroundImageUrl: res.backgroundImageUrl,
    quickActionsEnabled: res.quickActionsEnabled,
    enabledQuickActions: normalizeQuickActions(res.enabledQuickActions),
  };

  if (process.env.NODE_ENV !== 'production') {
    assertWidgetConfig(config);
  }

  return config;
}

export async function resolveWidgetConfig(
  params: URLSearchParams
): Promise<WidgetConfig> {
  const widgetId = params.get('widgetId');

  if (!widgetId) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[WidgetConfig] No widgetId in URL — rendering defaults; encoder calls will not route'
      );
    }
    return defaultsForWidgetId(FALLBACK_WIDGET_ID);
  }

  const baseUrl = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL;
  if (!baseUrl) {
    console.error(
      '[WidgetConfig] NEXT_PUBLIC_CHAT_SERVICE_URL is not set; falling back to defaults'
    );
    return defaultsForWidgetId(widgetId);
  }

  try {
    const res = await fetch(
      `${baseUrl}/api/widget-config/${encodeURIComponent(widgetId)}`
    );
    if (!res.ok) {
      console.error(
        `[WidgetConfig] Chat service returned ${res.status} for widgetId=${widgetId}; using defaults`
      );
      return defaultsForWidgetId(widgetId);
    }
    const body = (await res.json()) as WidgetConfigResponse;
    return fromResponse(body);
  } catch (error) {
    console.error('[WidgetConfig] Fetch failed, using defaults', error);
    return defaultsForWidgetId(widgetId);
  }
}

function assertWidgetConfig(config: WidgetConfig): void {
  if (!config.widgetId) {
    console.error('[WidgetConfig] widgetId resolved to empty string');
  }
  if (config.enabledLanguages.length === 0) {
    console.error('[WidgetConfig] enabledLanguages is empty after parsing');
  }
  if (!config.enabledLanguages.includes(config.defaultLanguage)) {
    console.error(
      `[WidgetConfig] defaultLanguage ${config.defaultLanguage} not in enabledLanguages`,
      config.enabledLanguages
    );
  }
}
