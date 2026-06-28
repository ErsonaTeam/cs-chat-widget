'use client';

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PhoneInput, defaultCountries, parseCountry } from 'react-international-phone';
import { isValidPhoneNumber } from 'libphonenumber-js';
import 'react-international-phone/style.css';
import DefaultIcon from './DefaultIcon';
import QuickActions from './QuickActions';
import type { WidgetTheme } from '@/config/theme-config';
import { type Language, t } from '@/utils/i18n';
import type { QuickActionId } from '@/config/widget-config';
import { DEFAULT_COUNTRY_CODE, formatPhoneForStorage } from '@/utils/phone';

const NAME_ERROR_CLEAR_MS = 700;

/** Collected guest contact, passed up on submit. Values are storage-ready
 *  (phone as digits "<countryCode><number>", matching formatPhoneForStorage). */
export interface CollectedContact {
  email?: string;
  phone?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Guess the default phone country (iso2) from the browser locale, e.g. "he-IL" -> "il".
// Falls back to Israel (matches DEFAULT_COUNTRY_CODE = '972'). Used as the instant
// default; refined by physical location (IP) once detectCountryByIp resolves.
function guessDefaultCountry(): string {
  if (typeof navigator === 'undefined') return 'il';
  const locale = navigator.language || '';
  const region = locale.split('-')[1];
  return region ? region.toLowerCase() : 'il';
}

// Detect the country by the device's physical location via IP, refining the
// locale-based default. Returns a lowercase iso2 (e.g. "il") or null. Best-effort:
// any failure (offline, rate-limit, CORS) is swallowed and the locale default stands.
async function detectCountryByIp(): Promise<string | null> {
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/country.json');
    if (!res.ok) return null;
    const data = (await res.json()) as { country?: string };
    const cc = data?.country?.trim().toLowerCase();
    return cc && /^[a-z]{2}$/.test(cc) ? cc : null;
  } catch {
    return null;
  }
}

// Memoize the IP lookup at module scope: one request per page load, shared by every
// mount of the welcome screen. This avoids the refetch/abort churn that happens when
// the widget remounts during config loading (which previously dropped the result).
let ipCountryPromise: Promise<string | null> | null = null;
function getIpCountryOnce(): Promise<string | null> {
  if (!ipCountryPromise) ipCountryPromise = detectCountryByIp();
  return ipCountryPromise;
}

// Look up a country's dial code (e.g. "il" -> "972") from react-international-phone's
// own country data, so we can switch the selected country via the controlled value.
function dialCodeForIso2(iso2: string): string | null {
  const found = defaultCountries.find((c) => parseCountry(c).iso2 === iso2);
  return found ? parseCountry(found).dialCode : null;
}

// Split an E.164 value ("+972541234567") from react-international-phone into the
// national number ("541234567") given the country dial code ("972").
function nationalNumber(e164: string, dialCode: string): string {
  const digits = e164.replace(/\D/g, '');
  return digits.startsWith(dialCode) ? digits.slice(dialCode.length) : digits;
}

interface WelcomeScreenProps {
  theme: WidgetTheme;
  hotelName: string | null;
  logoUrl: string | null;
  lang: Language;
  nameInput: string;
  onNameInputChange: (next: string) => void;
  onStart: (e: FormEvent, contact?: CollectedContact) => void;
  /** Guest contact collection (SCRUM-1089). All default to false → name-only, as today. */
  showEmail?: boolean;
  emailRequired?: boolean;
  showPhone?: boolean;
  phoneRequired?: boolean;
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
  showEmail = false,
  emailRequired = false,
  showPhone = false,
  phoneRequired = false,
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

  // ── Guest contact collection (SCRUM-1089) ──────────────────────────────────
  // Instant default from the browser locale; refined by IP below.
  const [defaultCountry] = useState(guessDefaultCountry);
  const [email, setEmail] = useState('');
  const [phoneE164, setPhoneE164] = useState('');
  const [phoneDialCode, setPhoneDialCode] = useState(DEFAULT_COUNTRY_CODE);
  const [showContactErrors, setShowContactErrors] = useState(false);
  // True once the guest starts typing a phone number — freezes the auto-detected
  // country so a late IP result never overrides what the user is entering.
  const phoneTouchedRef = useRef(false);

  // Refine the phone country by the device's physical location (IP) on top of the
  // locale-based default, unless the guest already started typing. We switch the
  // country through the controlled value (set it to the dial code, e.g. "+972"),
  // which reliably moves the selector — changing defaultCountry alone does not while
  // the value is controlled. Memoized lookup → one request across remounts. (SCRUM-1089)
  useEffect(() => {
    if (!showPhone) return;
    let cancelled = false;
    getIpCountryOnce().then((cc) => {
      if (cancelled || !cc || phoneTouchedRef.current) return;
      const dial = dialCodeForIso2(cc);
      if (dial) {
        setPhoneE164(`+${dial}`);
        setPhoneDialCode(dial);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showPhone]);

  const phoneNational = nationalNumber(phoneE164, phoneDialCode);
  const emailProvided = email.trim() !== '';
  const phoneProvided = phoneNational.length > 0;
  const emailValid = EMAIL_REGEX.test(email.trim());
  // Validate the full E.164 number against the selected country's real numbering
  // rules (libphonenumber-js), not just length — catches too-short/invalid numbers.
  const phoneValid = phoneProvided && isValidPhoneNumber(phoneE164);

  // A shown field is "ok" when: not required and empty, or its value is valid.
  const emailOk = !showEmail ? true : emailRequired ? emailValid : !emailProvided || emailValid;
  const phoneOk = !showPhone ? true : phoneRequired ? phoneValid : !phoneProvided || phoneValid;
  const canSubmit = nameInput.trim() !== '' && emailOk && phoneOk;

  const emailErr = showContactErrors && showEmail && !emailOk;
  const phoneErr = showContactErrors && showPhone && !phoneOk;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    if (!canSubmit) {
      setShowContactErrors(true);
      return;
    }
    const contact: CollectedContact = {};
    if (showEmail && emailProvided) contact.email = email.trim();
    if (showPhone && phoneProvided) {
      contact.phone = formatPhoneForStorage(phoneNational, phoneDialCode);
    }
    onStart(e, contact);
  }

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

          <form onSubmit={handleSubmit} className="space-y-3" aria-label="Start chat">
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

            {/* Email (SCRUM-1089) */}
            {showEmail && (
              <div>
                <label className="block">
                  <span className="sr-only">{lang === 'HE' ? 'אימייל' : 'Email'}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (showContactErrors) setShowContactErrors(false);
                    }}
                    placeholder={`${lang === 'HE' ? 'אימייל' : 'Email'}${
                      emailRequired ? '' : lang === 'HE' ? ' (אופציונלי)' : ' (optional)'
                    }`}
                    aria-invalid={emailErr}
                    inputMode="email"
                    autoComplete="email"
                    className={`w-full px-4 py-3 rounded-xl bg-text/[0.03] border focus:bg-surface focus:outline-none focus:ring-2 text-text placeholder:text-text/40 text-sm transition-colors ${
                      emailErr
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-300/40'
                        : 'border-border focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                </label>
                {emailErr && (
                  <p className="mt-1 text-xs text-red-500">
                    {lang === 'HE' ? 'אנא הזינו כתובת אימייל תקינה' : 'Please enter a valid email'}
                  </p>
                )}
              </div>
            )}

            {/* Phone with international country selector (SCRUM-1089) */}
            {showPhone && (
              <div dir="ltr">
                <span className="sr-only">{lang === 'HE' ? 'טלפון' : 'Phone'}</span>
                <PhoneInput
                  defaultCountry={defaultCountry}
                  value={phoneE164}
                  // Dial code is a fixed, non-editable prefix (chosen via the flag
                  // dropdown). The guest types only the national number — they can't
                  // edit or select the "+972" as text.
                  disableDialCodeAndPrefix
                  showDisabledDialCodeAndPrefix
                  onChange={(phone, meta) => {
                    setPhoneE164(phone);
                    setPhoneDialCode(meta.country.dialCode);
                    if (phone.replace(/\D/g, '').length > meta.country.dialCode.length) {
                      phoneTouchedRef.current = true;
                    }
                    if (showContactErrors) setShowContactErrors(false);
                  }}
                  inputClassName="ersona-phone-input"
                  className={`ersona-phone w-full${phoneErr ? ' ersona-phone--error' : ''}`}
                  inputProps={{ 'aria-invalid': phoneErr }}
                />
                {phoneErr && (
                  <p className="mt-1 text-xs text-red-500">
                    {lang === 'HE' ? 'אנא הזינו מספר טלפון תקין' : 'Please enter a valid phone number'}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
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
