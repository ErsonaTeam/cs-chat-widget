"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Language, t, getLanguageConfig } from "@/utils/i18n";
import { validatePhone, formatPhoneForStorage } from "@/utils/phone";

interface ContactFormProps {
  lang: Language;
  onSubmit: (formData: Record<string, string | boolean>) => void;
  disabled?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm({
  lang,
  onSubmit,
  disabled = false,
}: ContactFormProps) {
  const langConfig = getLanguageConfig(lang);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("972");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const countryCodes = [
    { code: "972", label: "+972" },
    { code: "1", label: "+1" },
    { code: "44", label: "+44" },
    { code: "49", label: "+49" },
    { code: "33", label: "+33" },
    { code: "39", label: "+39" },
    { code: "34", label: "+34" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitted) return;

    const newErrors: Record<string, string> = {};

    // Validate email
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      newErrors.email = t(lang, "contactFormInvalidEmail");
    }

    // Validate phone
    if (!phone.trim() || !validatePhone(phone, countryCode)) {
      newErrors.phone = t(lang, "contactFormInvalidPhone");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);

    onSubmit({
      email: email.trim(),
      phone: formatPhoneForStorage(phone, countryCode),
      marketingOptIn,
    });
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
        {/* Email field */}
        <div>
          <label className="block text-xs font-medium text-primary/70 mb-1">
            {t(lang, "contactFormEmail")}
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
            placeholder={t(lang, "contactFormEmailPlaceholder")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone field */}
        <div>
          <label className="block text-xs font-medium text-primary/70 mb-1">
            {t(lang, "contactFormPhone")}
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
              {countryCodes.map((cc) => (
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
              placeholder={t(lang, "contactFormPhonePlaceholder")}
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
          {t(lang, "contactFormSubmit")}
        </motion.button>
      </form>
    </motion.div>
  );
}
