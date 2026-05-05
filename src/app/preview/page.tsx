'use client';

import { Suspense, useState, useCallback, useEffect, FormEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { themes, getTheme } from '@/config/theme-config';
import { resolveWidgetConfig } from '@/config/resolve-widget-config';
import type { Language } from '@/utils/i18n';
import type { QuickActionId, WidgetConfig } from '@/config/widget-config';

import WidgetShell from '@/components/shell/WidgetShell';
import WelcomeScreen from '@/components/shell/WelcomeScreen';
import ChatHeader from '@/components/shell/ChatHeader';
import MessageBubble from '@/components/shell/MessageBubble';
import Composer from '@/components/shell/Composer';
import LanguageSelector from '@/components/shell/LanguageSelector';
import QuickActions from '@/components/shell/QuickActions';

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_BG_URL =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200';

const SAMPLE_HOTEL_NAME = 'Hotel Ben-Yamin';

interface SampleMsg {
  id: string;
  sender: 'bot' | 'user';
  he: string;
  en: string;
  timestamp: Date;
}

const BASE_TIME = new Date('2025-01-01T10:00:00');
const t1 = new Date(BASE_TIME.getTime() + 0 * 60_000);
const t2 = new Date(BASE_TIME.getTime() + 1 * 60_000);
const t3 = new Date(BASE_TIME.getTime() + 2 * 60_000);

const SAMPLE_MESSAGES: SampleMsg[] = [
  {
    id: '1',
    sender: 'bot',
    he: 'היי יוסי, ברוכים הבאים! איך נוכל לעזור לך היום?',
    en: 'Hi Yossi, welcome! How can we help you today?',
    timestamp: t1,
  },
  {
    id: '2',
    sender: 'user',
    he: 'אשמח לבצע הזמנה',
    en: "I'd like to make a reservation",
    timestamp: t2,
  },
  {
    id: '3',
    sender: 'bot',
    he: 'שלום יוסי! אשמח לעזור לך למצוא את האפשרות המתאימה. כדי שנתחיל, אשמח לדעת:\n1. אילו תאריכים תרצה?\n2. לכמה אורחים?\n3. באיזו חבילה אתה מעוניין?',
    en: "Hi Yossi! I'd be happy to help you find the right option. To get started, I'd like to know:\n1. What dates are you looking for?\n2. How many guests?\n3. What package are you interested in?",
    timestamp: t3,
  },
];

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

interface ToolbarProps {
  themeId: string;
  lang: Language;
  screen: 'welcome' | 'chat';
  hasHotelName: boolean;
  hasBg: boolean;
  onThemeChange: (v: string) => void;
  onLangChange: (v: Language) => void;
  onScreenChange: (v: 'welcome' | 'chat') => void;
  onHotelNameToggle: (v: boolean) => void;
  onBgToggle: (v: boolean) => void;
}

function Toolbar({
  themeId,
  lang,
  screen,
  hasHotelName,
  hasBg,
  onThemeChange,
  onLangChange,
  onScreenChange,
  onHotelNameToggle,
  onBgToggle,
}: ToolbarProps) {
  const selectBase =
    'px-2 py-1.5 rounded-md border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400';
  const btnBase =
    'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors';
  const btnActive = 'bg-blue-600 text-white border-blue-600';
  const btnInactive = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  const labelBase = 'flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none';

  return (
    <div
      style={{ background: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}
      className="px-4 py-2.5 flex flex-wrap items-center gap-3"
    >
      {/* Theme */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Theme
        </span>
        <select
          value={themeId}
          onChange={(e) => onThemeChange(e.target.value)}
          className={selectBase}
        >
          {Object.values(themes).map((t) => (
            <option key={t.id} value={t.id}>
              {t.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <span className="w-px h-5 bg-gray-300" />

      {/* Language */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Lang
        </span>
        <div className="flex rounded-md overflow-hidden border border-gray-300">
          {(['HE', 'EN'] as Language[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLangChange(l)}
              className={`${btnBase} rounded-none border-0 border-r last:border-r-0 border-gray-300 ${
                lang === l ? btnActive : btnInactive
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <span className="w-px h-5 bg-gray-300" />

      {/* Screen toggle */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Screen
        </span>
        <div className="flex rounded-md overflow-hidden border border-gray-300">
          {(['welcome', 'chat'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onScreenChange(s)}
              className={`${btnBase} rounded-none border-0 border-r last:border-r-0 border-gray-300 ${
                screen === s ? btnActive : btnInactive
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <span className="w-px h-5 bg-gray-300" />

      {/* Hotel name toggle */}
      <label className={labelBase}>
        <input
          type="checkbox"
          checked={hasHotelName}
          onChange={(e) => onHotelNameToggle(e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        <span>Hotel name</span>
      </label>

      {/* BG image toggle */}
      <label className={labelBase}>
        <input
          type="checkbox"
          checked={hasBg}
          onChange={(e) => onBgToggle(e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        <span>BG image</span>
      </label>

      {/* Info badge */}
      <span className="ms-auto text-[10px] text-gray-400 font-mono hidden sm:inline">
        /preview — dev only
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Welcome preview
// ---------------------------------------------------------------------------

interface WelcomePreviewProps {
  config: WidgetConfig;
  lang: Language;
  onLangChange: (l: Language) => void;
}

function WelcomePreview({ config, lang, onLangChange }: WelcomePreviewProps) {
  const [nameInput, setNameInput] = useState('');
  const theme = getTheme(config.selectedTheme);
  const direction = lang === 'HE' ? 'rtl' : 'ltr';

  const handleStart = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      console.log('[preview] start with name:', nameInput);
    },
    [nameInput]
  );

  const handleQuickAction = useCallback((id: QuickActionId) => {
    console.log('[preview] quick action:', id);
  }, []);

  const langSelector = config.showLanguageSelector ? (
    <LanguageSelector
      current={lang}
      enabled={config.enabledLanguages}
      onChange={onLangChange}
    />
  ) : undefined;

  return (
    <WidgetShell
      theme={theme}
      showBackground
      backgroundImageUrl={config.backgroundImageUrl}
      direction={direction}
    >
      <WelcomeScreen
        theme={theme}
        hotelName={config.hotelName}
        logoUrl={config.logoUrl}
        lang={lang}
        nameInput={nameInput}
        onNameInputChange={setNameInput}
        onStart={handleStart}
        quickActionsEnabled={config.quickActionsEnabled}
        enabledQuickActions={config.enabledQuickActions}
        onQuickAction={handleQuickAction}
        rightSlot={langSelector}
      />
    </WidgetShell>
  );
}

// ---------------------------------------------------------------------------
// Chat preview
// ---------------------------------------------------------------------------

interface ChatPreviewProps {
  config: WidgetConfig;
  lang: Language;
  onLangChange: (l: Language) => void;
}

function ChatPreview({ config, lang, onLangChange }: ChatPreviewProps) {
  const [composerValue, setComposerValue] = useState('');
  const theme = getTheme(config.selectedTheme);
  const direction = lang === 'HE' ? 'rtl' : 'ltr';

  const handleSubmit = useCallback(() => {
    console.log('[preview] send message:', composerValue);
    setComposerValue('');
  }, [composerValue]);

  const handleQuickAction = useCallback((id: QuickActionId) => {
    console.log('[preview] chat quick action:', id);
  }, []);

  const langSelector = config.showLanguageSelector ? (
    <LanguageSelector
      current={lang}
      enabled={config.enabledLanguages}
      onChange={onLangChange}
    />
  ) : undefined;

  return (
    <WidgetShell
      theme={theme}
      showBackground={false}
      backgroundImageUrl={null}
      direction={direction}
    >
      <ChatHeader
        theme={theme}
        hotelName={config.hotelName}
        logoUrl={config.logoUrl}
        lang={lang}
        onReset={() => console.log('[preview] reset')}
        rightSlot={langSelector}
      />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 bg-background">
        {SAMPLE_MESSAGES.map((msg) => (
          <MessageBubble
            key={msg.id}
            sender={msg.sender}
            text={lang === 'HE' ? msg.he : msg.en}
            timestamp={msg.timestamp}
            direction={msg.sender === 'user' ? direction : lang === 'HE' ? 'rtl' : 'ltr'}
          />
        ))}
      </div>

      {/* Composer with suggestion chips */}
      <Composer
        value={composerValue}
        onChange={setComposerValue}
        onSubmit={handleSubmit}
        placeholder={theme.text[lang].inputPlaceholder}
        direction={direction}
        formLabel={lang === 'HE' ? 'כתיבת הודעה' : 'Message composer'}
        chipsSlot={
          config.quickActionsEnabled && config.enabledQuickActions.length > 0 ? (
            <QuickActions
              enabled={config.enabledQuickActions}
              lang={lang}
              variant="chat"
              onSelect={handleQuickAction}
            />
          ) : undefined
        }
      />
    </WidgetShell>
  );
}

// ---------------------------------------------------------------------------
// Simulator container
// ---------------------------------------------------------------------------

function SimulatorContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '24px 16px',
        background: '#e5e7eb',
      }}
    >
      {/* On mobile: stretch full width. On desktop: fixed 400×700. */}
      <div
        style={{
          width: 'min(400px, 100%)',
          height: '700px',
          border: '1px solid #d1d5db',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow:
            '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Core preview content (reads search params)
// ---------------------------------------------------------------------------

function PreviewContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive current values from URL
  const themeId = searchParams.get('theme') || 'urban';
  const urlLang = (searchParams.get('lang') || 'HE').toUpperCase() as Language;
  const screen = (searchParams.get('screen') || 'welcome') as 'welcome' | 'chat';
  const hasHotelName = searchParams.get('hotelName') !== null;
  const hasBg = searchParams.get('bgUrl') !== null;

  // Local language state so LanguageSelector updates are instant (no full
  // page reload), while also being URL-sync'd as secondary truth.
  const [lang, setLang] = useState<Language>(urlLang);

  // Build a resolved config from current URL params (async fetch from chat service)
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  useEffect(() => {
    let cancelled = false;
    resolveWidgetConfig(new URLSearchParams(searchParams.toString()))
      .then((c) => { if (!cancelled) setConfig(c); })
      .catch((err) => console.error('[preview] resolveWidgetConfig error', err));
    return () => { cancelled = true; };
  }, [searchParams]);

  // ---------------------------------------------------------------------------
  // URL update helpers
  // ---------------------------------------------------------------------------

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleThemeChange = useCallback(
    (v: string) => updateParam('theme', v),
    [updateParam]
  );

  const handleLangChange = useCallback(
    (v: Language) => {
      setLang(v);
      updateParam('lang', v);
    },
    [updateParam]
  );

  const handleScreenChange = useCallback(
    (v: 'welcome' | 'chat') => updateParam('screen', v),
    [updateParam]
  );

  const handleHotelNameToggle = useCallback(
    (checked: boolean) =>
      updateParam('hotelName', checked ? SAMPLE_HOTEL_NAME : null),
    [updateParam]
  );

  const handleBgToggle = useCallback(
    (checked: boolean) => updateParam('bgUrl', checked ? SAMPLE_BG_URL : null),
    [updateParam]
  );

  // Sync local lang if URL lang changes (e.g. browser back/forward)
  // We compare against urlLang which is derived each render.
  if (lang !== urlLang && !['welcome', 'chat'].includes(lang as string)) {
    // fallback guard — no-op branch, handled by state initialisation
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#e5e7eb',
      }}
    >
      <Toolbar
        themeId={themeId}
        lang={lang}
        screen={screen}
        hasHotelName={hasHotelName}
        hasBg={hasBg}
        onThemeChange={handleThemeChange}
        onLangChange={handleLangChange}
        onScreenChange={handleScreenChange}
        onHotelNameToggle={handleHotelNameToggle}
        onBgToggle={handleBgToggle}
      />

      <SimulatorContainer>
        {!config ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : screen === 'welcome' ? (
          <WelcomePreview
            config={config}
            lang={lang}
            onLangChange={handleLangChange}
          />
        ) : (
          <ChatPreview
            config={config}
            lang={lang}
            onLangChange={handleLangChange}
          />
        )}
      </SimulatorContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export (with Suspense boundary for useSearchParams)
// ---------------------------------------------------------------------------

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e5e7eb',
            color: '#6b7280',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Loading preview...
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
