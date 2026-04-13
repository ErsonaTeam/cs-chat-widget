"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Language, t, getLanguageConfig } from "@/utils/i18n";
import { WidgetFormId } from "@/types/message-types";

interface FattalOtpVerifyFormProps {
  lang: Language;
  onSubmit: (formData: Record<string, string | boolean>) => void;
  disabled?: boolean;
}

export default function FattalOtpVerifyForm({
  lang,
  onSubmit,
  disabled = false,
}: FattalOtpVerifyFormProps) {
  const langConfig = getLanguageConfig(lang);

  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitted) return;

    if (!otpCode.trim() || otpCode.trim().length < 4 || otpCode.trim().length > 10) {
      setError(lang === "HE" ? "קוד אימות לא תקין" : "Invalid verification code");
      return;
    }

    setError("");
    setSubmitted(true);

    onSubmit({
      formType: WidgetFormId.FATTAL_OTP_VERIFY,
      otp_code: otpCode.trim(),
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
        {/* OTP code field */}
        <div>
          <label className="block text-xs font-medium text-primary/70 mb-1">
            {t(lang, "fattalOtpLabel")}
          </label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => {
              setOtpCode(e.target.value);
              setError("");
            }}
            disabled={disabled}
            dir="ltr"
            inputMode="numeric"
            minLength={4}
            maxLength={10}
            className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg
                     bg-white text-primary text-sm focus:outline-none focus:border-accent
                     placeholder:text-primary/40 disabled:opacity-50"
            placeholder={t(lang, "fattalOtpPlaceholder")}
          />
          {error && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
          )}
        </div>

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
          {t(lang, "fattalSubmitOtp")}
        </motion.button>
      </form>
    </motion.div>
  );
}
