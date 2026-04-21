"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Language, t, getLanguageConfig } from "@/utils/i18n";
import { validatePhone, formatPhoneForStorage } from "@/utils/phone";
import { WidgetFormId } from "@/types/message-types";

interface GuestDetailsFormProps {
  lang: Language;
  onSubmit: (formData: Record<string, string | boolean>) => void;
  disabled?: boolean;
  /** Optional prefill data from the backend (firstName, lastName, email, phone) */
  formData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COUNTRY_CODES = [
  { code: "972", label: "+972" },
  { code: "1", label: "+1" },
  { code: "44", label: "+44" },
  { code: "49", label: "+49" },
  { code: "33", label: "+33" },
  { code: "39", label: "+39" },
  { code: "34", label: "+34" },
];

export default function GuestDetailsForm({
  lang,
  onSubmit,
  disabled = false,
  formData,
}: GuestDetailsFormProps) {
  const langConfig = getLanguageConfig(lang);

  const [firstName, setFirstName] = useState(formData?.firstName ?? "");
  const [lastName, setLastName] = useState(formData?.lastName ?? "");
  const [email, setEmail] = useState(formData?.email ?? "");
  const [phone, setPhone] = useState(formData?.phone ?? "");
  const [countryCode, setCountryCode] = useState("972");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitted) return;

    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = t(lang, "guestyGuestDetailsInvalidFirstName");
    }

    if (!lastName.trim()) {
      newErrors.lastName = t(lang, "guestyGuestDetailsInvalidLastName");
    }

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      newErrors.email = t(lang, "guestyGuestDetailsInvalidEmail");
    }

    // Phone is optional — only validate if something was entered
    if (phone.trim() && !validatePhone(phone, countryCode)) {
      newErrors.phone = t(lang, "guestyGuestDetailsInvalidPhone");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);

    const payload: Record<string, string | boolean> = {
      formType: WidgetFormId.GUESTY_GUEST_DETAILS,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      marketingOptIn,
    };

    if (phone.trim()) {
      payload.phone = formatPhoneForStorage(phone, countryCode);
    }

    onSubmit(payload);
  };

  if (submitted) {
    return null;
  }

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
        {/* First Name */}
        <div>
          <label className="block text-xs font-medium text-primary/70 mb-1">
            {t(lang, "guestyGuestDetailsFirstName")}
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors((prev) => ({ ...prev, firstName: "" }));
            }}
            disabled={disabled}
            className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg
                     bg-white text-primary text-sm focus:outline-none focus:border-accent
                     placeholder:text-primary/40 disabled:opacity-50"
            placeholder={t(lang, "guestyGuestDetailsFirstNamePlaceholder")}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-xs font-medium text-primary/70 mb-1">
            {t(lang, "guestyGuestDetailsLastName")}
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setErrors((prev) => ({ ...prev, lastName: "" }));
            }}
            disabled={disabled}
            className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg
                     bg-white text-primary text-sm focus:outline-none focus:border-accent
                     placeholder:text-primary/40 disabled:opacity-50"
            placeholder={t(lang, "guestyGuestDetailsLastNamePlaceholder")}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-primary/70 mb-1">
            {t(lang, "guestyGuestDetailsEmail")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            disabled={disabled}
            dir="ltr"
            className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg
                     bg-white text-primary text-sm focus:outline-none focus:border-accent
                     placeholder:text-primary/40 disabled:opacity-50"
            placeholder={t(lang, "guestyGuestDetailsEmailPlaceholder")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="block text-xs font-medium text-primary/70 mb-1">
            {t(lang, "guestyGuestDetailsPhone")}
          </label>
          <div className="flex gap-2" dir="ltr">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              disabled={disabled}
              className="px-2 py-2 bg-primary/5 border-2 border-primary/20 rounded-lg
                       text-primary text-sm focus:outline-none focus:border-accent
                       cursor-pointer"
            >
              {COUNTRY_CODES.map((cc) => (
                <option key={cc.code} value={cc.code}>
                  {cc.label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              disabled={disabled}
              className="flex-1 px-3 py-2 border-2 border-primary/20 rounded-lg
                       bg-white text-primary text-sm focus:outline-none focus:border-accent
                       placeholder:text-primary/40 disabled:opacity-50"
              placeholder={t(lang, "guestyGuestDetailsPhonePlaceholder")}
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Marketing opt-in checkbox */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            disabled={disabled}
            className="mt-0.5 accent-accent"
          />
          <span className="text-xs text-primary/70">
            {t(lang, "marketingOptIn")}
          </span>
        </label>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={disabled || submitted}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2.5 px-4
                   rounded-lg transition-colors shadow-sm text-sm
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t(lang, "guestyGuestDetailsSubmit")}
        </motion.button>
      </form>
    </motion.div>
  );
}
