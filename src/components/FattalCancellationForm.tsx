"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type Language, t, getLanguageConfig, parseLanguageCode } from "@/utils/i18n";
import { WidgetFormId } from "@/types/message-types";

interface CancellationOrderData {
  hotel: string;
  masterId: string;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  plan: string;
  totalPrice: string;
  languageCode?: string;
}

interface FattalCancellationFormProps {
  lang: Language;
  onSubmit: (formData: Record<string, string | boolean>) => void;
  disabled?: boolean;
  formData?: CancellationOrderData;
}

export default function FattalCancellationForm({
  lang: defaultLang,
  onSubmit,
  disabled = false,
  formData,
}: FattalCancellationFormProps) {
  // Use languageCode from formData if available, otherwise fall back to widget lang
  const lang = formData?.languageCode
    ? parseLanguageCode(formData.languageCode)
    : defaultLang;
  const langConfig = getLanguageConfig(lang);
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = () => {
    if (disabled || submitted) return;
    setSubmitted(true);
    onSubmit({
      formType: WidgetFormId.FATTAL_CANCELLATION_CONFIRM,
      confirmed: true,
      masterId: formData?.masterId ?? "",
    });
  };

  const handleDecline = () => {
    if (disabled || submitted) return;
    setSubmitted(true);
    onSubmit({
      formType: WidgetFormId.FATTAL_CANCELLATION_CONFIRM,
      confirmed: false,
      masterId: formData?.masterId ?? "",
    });
  };

  if (submitted) {
    return null;
  }

  const guestCount = formData
    ? formData.adults + formData.children + formData.infants
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2"
      dir={langConfig.dir}
    >
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4 space-y-3">
        {/* Title */}
        <p className="text-sm font-semibold text-primary">
          {t(lang, "fattalCancelTitle")}
        </p>

        {/* Order details */}
        {formData && (
          <div className="bg-text/[0.04] rounded-lg p-3 space-y-1.5 text-xs text-primary/80">
            <div className="flex justify-between">
              <span className="font-medium">{t(lang, "fattalCancelHotel")}</span>
              <span>{formData.hotel}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t(lang, "fattalCancelDates")}</span>
              <span dir="ltr">{formData.arrivalDate} — {formData.departureDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t(lang, "fattalCancelNights")}</span>
              <span>{formData.nights}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t(lang, "fattalCancelGuests")}</span>
              <span>{guestCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t(lang, "fattalCancelPlan")}</span>
              <span>{formData.plan}</span>
            </div>
            <div className="border-t border-border pt-1.5 flex justify-between font-semibold text-primary">
              <span>{t(lang, "fattalCancelTotal")}</span>
              <span dir="ltr">₪{formData.totalPrice}</span>
            </div>
            <div className="text-[10px] text-primary/50">
              {t(lang, "fattalCancelOrderId")}: {formData.masterId}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={handleConfirm}
            disabled={disabled || submitted}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4
                     rounded-lg transition-colors shadow-sm text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(lang, "fattalCancelConfirm")}
          </motion.button>
          <motion.button
            type="button"
            onClick={handleDecline}
            disabled={disabled || submitted}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-text/[0.04] hover:bg-text/[0.08] text-primary font-semibold py-2.5 px-4
                     rounded-lg transition-colors shadow-sm text-sm border border-border
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(lang, "fattalCancelDecline")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
