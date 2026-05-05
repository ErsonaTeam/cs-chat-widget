// Default country code (Israel)
export const DEFAULT_COUNTRY_CODE = '972';

/**
 * Validates a phone number based on country code
 * For Israel (972): strict validation for mobile numbers starting with 5
 * For other countries: basic length validation (7-15 digits)
 */
export function validatePhone(phone: string, countryCode: string = DEFAULT_COUNTRY_CODE): boolean {
  const cleaned = phone.replace(/\D/g, '');

  if (!cleaned) return false;

  // Israeli phone validation (strict)
  if (countryCode === '972') {
    // Check: 9-10 digits (e.g., 548060982 or 0548060982)
    // Must start with 0?5 (Israeli mobile)
    return /^0?5[0-9]{8}$/.test(cleaned);
  }

  // Generic validation for other countries (7-15 digits)
  return cleaned.length >= 7 && cleaned.length <= 15;
}

/**
 * Validates an Israeli phone number (legacy function for backwards compatibility)
 */
export function validateIsraeliPhone(phone: string): boolean {
  return validatePhone(phone, '972');
}

/**
 * Formats phone number for storage: "972548060982"
 * Removes leading 0 and non-digit characters
 */
export function formatPhoneForStorage(
  phone: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string {
  let cleaned = phone.replace(/\D/g, '');
  // Remove leading 0 (common in many countries)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return `${countryCode}${cleaned}`;
}

/**
 * Formats phone number for display: "+972548060982"
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  return `+${phone}`;
}