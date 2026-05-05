'use client';

import { type FormEvent, type ReactNode, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import DefaultIcon from './DefaultIcon';
import QuickActions from './QuickActions';
import type { WidgetTheme } from '@/config/theme-config';
import { type Language, t } from '@/utils/i18n';
import type { QuickActionId } from '@/config/widget-config';

const NAME_ERROR_CLEAR_MS = 700;

interface WelcomeScreenProps {
  theme: WidgetTheme;
  hotelName: string | null;
  logoUrl: string | null;
  lang: Language;
  nameInput: string;
  onNameInputChange: (next: string) => void;
  onStart: (e: FormEvent) => void;
  quickActionsEnabled: boolean;
  enabledQuickActions: QuickActionId[];
  onQuickAction: (id: QuickActionId) => void;
  /** Slot for the LanguageSelector (header area) */
  rightSlot?: ReactNode;
}

export default function WelcomeScreen({
  theme,
  hotelName,
  logoUrl,
  lang,
  nameInput,
  onNameInputChange,
  onStart,
  quickActionsEnabled,
  enabledQuickActions,
  onQuickAction,
  rightSlot,
}: WelcomeScreenProps) {
  const themeText = theme.text[lang];
  const effectiveLogo = logoUrl ?? theme.logoUrl;
  const displayedTitle =
    hotelName != null && hotelName.length > 0
      ? lang === 'HE'
        ? `ברוכים הבאים ל${hotelName}`
        : `Welcome to ${hotelName}`
      : themeText.welcomeTitle;
  const subtitle = t(lang, 'welcomeSubtitle');

  const [nameError, setNameError] = useState(false);
  const errorClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearErrorTimer() {
    if (errorClearTimer.current) {
      clearTimeout(errorClearTimer.current);
      errorClearTimer.current = null;
    }
  }

  function handleNameChange(value: string) {
    if (nameError) {
      clearErrorTimer();
      setNameError(false);
    }
    onNameInputChange(value);
  }

  function handleQuickActionAttempt(id: QuickActionId) {
    if (!nameInput.trim()) {
      clearErrorTimer();
      setNameError(true);
      errorClearTimer.current = setTimeout(() => {
        setNameError(false);
        errorClearTimer.current = null;
      }, NAME_ERROR_CLEAR_MS);
      return;
    }
    onQuickAction(id);
  }

  return (
    <div className="relative h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {effectiveLogo ? (
            <Image
              src={effectiveLogo}
              alt=""
              width={theme.logoSize.width}
              height={theme.logoSize.height}
              className="rounded-md object-contain shrink-0"
            />
          ) : (
            <div className="shrink-0 w-7 h-7 rounded-full bg-surface/90 backdrop-blur text-primary flex items-center justify-center">
              <DefaultIcon size={16} />
            </div>
          )}
          {hotelName && (
            <span className="text-sm font-medium text-surface/95 truncate drop-shadow">
              {hotelName}
            </span>
          )}
        </div>
        {rightSlot}
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md bg-surface/95 backdrop-blur rounded-2xl shadow-2xl border border-border/40 p-6 sm:p-7"
        >
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-primary text-surface flex items-center justify-center mb-3">
              <DefaultIcon size={24} />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-text mb-1.5">
              {displayedTitle}
            </h1>
            <p className="text-sm text-text/60 leading-relaxed">{subtitle}</p>
          </div>

          <form onSubmit={onStart} className="space-y-3" aria-label="Start chat">
            <motion.div
              animate={nameError ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <label className="block">
                <span className="sr-only">{themeText.nameLabel}</span>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={themeText.namePlaceholder}
                  aria-invalid={nameError}
                  className={`w-full px-4 py-3 rounded-xl bg-text/[0.03] border focus:bg-surface focus:outline-none focus:ring-2 text-text placeholder:text-text/40 text-sm transition-colors ${
                    nameError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-300/40'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                  autoFocus
                />
              </label>
            </motion.div>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full py-3 rounded-xl bg-primary text-surface font-medium text-sm hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {themeText.startChat}
            </button>
          </form>

          {quickActionsEnabled && enabledQuickActions.length > 0 && (
            <div className="mt-4">
              <QuickActions
                enabled={enabledQuickActions}
                lang={lang}
                variant="welcome"
                onSelect={handleQuickActionAttempt}
              />
            </div>
          )}

          <div className="mt-5 text-center">
            <span className="text-[10px] text-text/40 tracking-wide">
              {t(lang, 'poweredBy')}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
