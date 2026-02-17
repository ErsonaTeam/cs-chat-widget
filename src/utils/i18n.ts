export type Language = 'HE' | 'EN';

export interface LanguageConfig {
  code: Language;
  dir: 'rtl' | 'ltr';
  locale: string;
}

export const languages: Record<Language, LanguageConfig> = {
  HE: {
    code: 'HE',
    dir: 'rtl',
    locale: 'he-IL',
  },
  EN: {
    code: 'EN',
    dir: 'ltr',
    locale: 'en-US',
  },
};

export const translations = {
  HE: {
    // Common
    select: 'בחר',
    startingFrom: 'החל מ-',
    back: 'חזרה',

    // Hotel Carousel
    availableHotels: 'מלונות זמינים',

    // Room Carousel
    availableRooms: 'חדרים זמינים',

    // Room Detail View
    backToRoomList: 'חזרה לרשימת החדרים',
    clubMember: 'חבר מועדון',
    selectPackage: 'בחר חבילה',
    backToPackageList: 'חזרה לרשימת החבילות',
    selectedPackage: 'חבילה נבחרת:',
    selectPensionType: 'בחר סוג פנסיון',
    roomsLeft: 'נותרו {count} חדרים!',
    clubPrice: 'מחיר מועדון',
    continueToBooking: 'המשך להזמנה',

    // Booking Confirmation
    bookingIntro: 'אני מעוניין להזמין:',
    roomLabel: 'חדר',
    packageLabel: 'חבילה',
    hostingTypeLabel: 'סוג אירוח',
    clubMemberYes: 'חבר מועדון: כן',
    priceLabel: 'מחיר',

    // Contact Form
    contactFormEmail: 'אימייל',
    contactFormEmailPlaceholder: 'your@email.com',
    contactFormPhone: 'טלפון',
    contactFormPhonePlaceholder: '054-806-0982',
    contactFormSubmit: 'שליחה',
    contactFormInvalidEmail: 'כתובת אימייל לא תקינה',
    contactFormInvalidPhone: 'מספר טלפון לא תקין',
    contactFormSubmitted: 'שלחתי את הפרטים שלי.',
  },
  EN: {
    // Common
    select: 'Select',
    startingFrom: 'From ',
    back: 'Back',

    // Hotel Carousel
    availableHotels: 'Available Hotels',

    // Room Carousel
    availableRooms: 'Available Rooms',

    // Room Detail View
    backToRoomList: 'Back to room list',
    clubMember: 'Club Member',
    selectPackage: 'Select Package',
    backToPackageList: 'Back to package list',
    selectedPackage: 'Selected package:',
    selectPensionType: 'Select pension type',
    roomsLeft: 'Only {count} rooms left!',
    clubPrice: 'Club price',
    continueToBooking: 'Continue to booking',

    // Booking Confirmation
    bookingIntro: 'I would like to book:',
    roomLabel: 'Room',
    packageLabel: 'Package',
    hostingTypeLabel: 'Hosting type',
    clubMemberYes: 'Club member: Yes',
    priceLabel: 'Price',

    // Contact Form
    contactFormEmail: 'Email',
    contactFormEmailPlaceholder: 'your@email.com',
    contactFormPhone: 'Phone',
    contactFormPhonePlaceholder: '054-806-0982',
    contactFormSubmit: 'Submit',
    contactFormInvalidEmail: 'Invalid email address',
    contactFormInvalidPhone: 'Invalid phone number',
    contactFormSubmitted: "I've submitted my contact details.",
  },
} as const;

export type TranslationKey = keyof typeof translations.HE;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations.EN[key] || key;
}

export function t(lang: Language, key: TranslationKey, params?: Record<string, string | number>): string {
  let text = getTranslation(lang, key);

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(`{${paramKey}}`, String(value));
    });
  }

  return text;
}

export function getLanguageConfig(lang: Language): LanguageConfig {
  return languages[lang] || languages.EN;
}

export function formatPrice(price: number, lang: Language): string {
  const config = getLanguageConfig(lang);
  return new Intl.NumberFormat(config.locale).format(Math.ceil(price));
}

/**
 * Convert a language code string to our Language type.
 * Handles various formats: 'he', 'HE', 'en', 'EN', 'he-IL', 'en-US', etc.
 */
export function parseLanguageCode(code: string | undefined | null): Language {
  if (!code) return 'HE'; // Default to Hebrew

  const normalized = code.toUpperCase().split('-')[0];

  if (normalized === 'EN') return 'EN';
  if (normalized === 'HE') return 'HE';

  // Default to Hebrew for unknown codes
  return 'HE';
}
