"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Language, t, getLanguageConfig } from "@/utils/i18n";
import { WidgetFormId } from "@/types/message-types";

interface FattalIdCollectFormProps {
  lang: Language;
  onSubmit: (formData: Record<string, string | boolean>) => void;
  disabled?: boolean;
}

export default function FattalIdCollectForm({
  lang,
  onSubmit,
  disabled = false,
}: FattalIdCollectFormProps) {
  const langConfig = getLanguageConfig(lang);

  const [israeliId, setIsraeliId] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"phone" | "email">("phone");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitted) return;

    if (!israeliId.trim() || israeliId.trim().length < 5 || israeliId.trim().length > 15) {
      setError(lang === "HE" ? "מספר תעודת זהות לא תקין" : "Invalid ID number");
      return;
    }

    setError("");
    setSubmitted(true);

    onSubmit({
      formType: WidgetFormId.FATTAL_ID_COLLECT,
      user_id: israeliId.trim(),
      method: deliveryMethod,
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
        {/* Israeli ID field */}
        <div>
          <label className="block text-xs font-medium text-primary/70 mb-1">
            {t(lang, "fattalIdLabel")}
          </label>
          <input
            type="text"
            value={israeliId}
            onChange={(e) => {
              setIsraeliId(e.target.value);
              setError("");
            }}
            disabled={disabled}
            dir="ltr"
            inputMode="numeric"
            minLength={5}
            maxLength={15}
            className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg
                     bg-white text-primary text-sm focus:outline-none focus:border-accent
                     placeholder:text-primary/40 disabled:opacity-50"
            placeholder={t(lang, "fattalIdPlaceholder")}
          />
          {error && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
          )}
        </div>

        {/* Delivery method radio group */}
        <div>
          <label className="block text-xs font-medium text-primary/70 mb-2">
            {t(lang, "fattalDeliveryMethod")}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="deliveryMethod"
                value="phone"
                checked={deliveryMethod === "phone"}
                onChange={() => setDeliveryMethod("phone")}
                disabled={disabled}
                className="accent-accent"
              />
              <span className="text-sm text-primary/80">
                {t(lang, "fattalDeliverySms")}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="deliveryMethod"
                value="email"
                checked={deliveryMethod === "email"}
                onChange={() => setDeliveryMethod("email")}
                disabled={disabled}
                className="accent-accent"
              />
              <span className="text-sm text-primary/80">
                {t(lang, "fattalDeliveryEmail")}
              </span>
            </label>
          </div>
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
          {t(lang, "fattalSubmitId")}
        </motion.button>
      </form>
    </motion.div>
  );
}
