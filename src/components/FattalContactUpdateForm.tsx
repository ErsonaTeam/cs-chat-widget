"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type Language, t, getLanguageConfig, parseLanguageCode } from "@/utils/i18n";

const HEBREW_MONTHS = [
  '', // index 0 unused
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const ENGLISH_MONTHS = [
  '',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface ContactUpdateFormData {
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  anniversaryDate: string | null;
  spouseBirthDate: string | null;
  preferredMonth: number | null;
  hasBirthDate: boolean;
  hasAnniversaryDate: boolean;
  hasSpouseBirthDate: boolean;
  hasPreferredMonth: boolean;
  languageCode?: string;
}

interface FattalContactUpdateFormProps {
  lang: Language;
  onSubmit: (formData: Record<string, string | boolean | number>) => void;
  disabled?: boolean;
  formData?: ContactUpdateFormData;
}

function FieldRow({
  label,
  locked,
  lockedTooltip,
  children,
}: {
  label: string;
  locked: boolean;
  lockedTooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-primary/70">{label}</label>
        {locked && lockedTooltip && (
          <span
            title={lockedTooltip}
            className="text-primary/40 cursor-default"
            aria-label={lockedTooltip}
          >
            {/* Lock SVG — Lucide-style 14x14 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const inputBaseClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50";

export default function FattalContactUpdateForm({
  lang: defaultLang,
  onSubmit,
  disabled = false,
  formData,
}: FattalContactUpdateFormProps) {
  const lang = formData?.languageCode
    ? parseLanguageCode(formData.languageCode)
    : defaultLang;
  const langConfig = getLanguageConfig(lang);

  const [phone, setPhone] = useState(formData?.phone ?? "");
  const [email, setEmail] = useState(formData?.email ?? "");
  const [birthDate, setBirthDate] = useState(formData?.birthDate ?? "");
  const [anniversaryDate, setAnniversaryDate] = useState(formData?.anniversaryDate ?? "");
  const [spouseBirthDate, setSpouseBirthDate] = useState(formData?.spouseBirthDate ?? "");
  const [preferredMonth, setPreferredMonth] = useState<string>(
    formData?.preferredMonth != null ? String(formData.preferredMonth) : ""
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitted) return;
    setSubmitted(true);

    const payload: Record<string, string | number> = { formType: "fattal_contact_update" };

    if (phone.trim()) payload.phone = phone.trim();
    if (email.trim()) payload.email = email.trim();
    if (!formData?.hasBirthDate && birthDate.trim()) payload.birthDate = birthDate.trim();
    if (!formData?.hasAnniversaryDate && anniversaryDate.trim()) payload.anniversaryDate = anniversaryDate.trim();
    if (!formData?.hasSpouseBirthDate && spouseBirthDate.trim()) payload.spouseBirthDate = spouseBirthDate.trim();
    if (!formData?.hasPreferredMonth && preferredMonth) payload.preferredMonth = Number(preferredMonth);

    onSubmit(payload as Record<string, string | boolean | number>);
  };

  if (submitted) {
    return null;
  }

  const lockedTooltip = t(lang, "fattalContactUpdateLockedTooltip");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2"
      dir={langConfig.dir}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-primary/10 shadow-sm p-4 space-y-3"
      >
        <p className="text-sm font-semibold text-primary">
          {t(lang, "fattalContactUpdateTitle")}
        </p>

        {/* Phone — always editable */}
        <FieldRow label={t(lang, "fattalContactUpdatePhone")} locked={false}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={disabled}
            className={inputBaseClass}
          />
        </FieldRow>

        {/* Email — always editable */}
        <FieldRow label={t(lang, "fattalContactUpdateEmail")} locked={false}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled}
            className={inputBaseClass}
          />
        </FieldRow>

        {/* Birth date — locked if hasBirthDate */}
        <FieldRow
          label={t(lang, "fattalContactUpdateBirthDate")}
          locked={!!formData?.hasBirthDate}
          lockedTooltip={lockedTooltip}
        >
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={disabled || !!formData?.hasBirthDate}
            className={inputBaseClass}
          />
        </FieldRow>

        {/* Anniversary date — locked if hasAnniversaryDate */}
        <FieldRow
          label={t(lang, "fattalContactUpdateAnniversary")}
          locked={!!formData?.hasAnniversaryDate}
          lockedTooltip={lockedTooltip}
        >
          <input
            type="date"
            value={anniversaryDate}
            onChange={(e) => setAnniversaryDate(e.target.value)}
            disabled={disabled || !!formData?.hasAnniversaryDate}
            className={inputBaseClass}
          />
        </FieldRow>

        {/* Spouse birth date — locked if hasSpouseBirthDate */}
        <FieldRow
          label={t(lang, "fattalContactUpdateSpouseBirthDate")}
          locked={!!formData?.hasSpouseBirthDate}
          lockedTooltip={lockedTooltip}
        >
          <input
            type="date"
            value={spouseBirthDate}
            onChange={(e) => setSpouseBirthDate(e.target.value)}
            disabled={disabled || !!formData?.hasSpouseBirthDate}
            className={inputBaseClass}
          />
        </FieldRow>

        {/* Preferred month — locked if hasPreferredMonth */}
        <FieldRow
          label={t(lang, "fattalContactUpdatePreferredMonth")}
          locked={!!formData?.hasPreferredMonth}
          lockedTooltip={lockedTooltip}
        >
          <select
            value={preferredMonth}
            onChange={(e) => setPreferredMonth(e.target.value)}
            disabled={disabled || !!formData?.hasPreferredMonth}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 cursor-pointer"
          >
            <option value="">—</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {lang === "HE" ? HEBREW_MONTHS[m] : ENGLISH_MONTHS[m]}
              </option>
            ))}
          </select>
        </FieldRow>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={disabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {t(lang, "fattalContactUpdateSubmit")}
        </motion.button>
      </form>
    </motion.div>
  );
}
