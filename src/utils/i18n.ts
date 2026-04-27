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

    // Listing Carousel
    availableListings: 'דירות זמינות',
    moreDetails: 'פרטים נוספים',
    bedrooms: 'חד׳ שינה',
    bathrooms: 'חדרי רחצה',
    guests: 'אורחים',
    perNight: '/לילה',
    total: 'סה״כ',
    backToListings: 'חזרה לרשימת הדירות',
    selectListing: 'בחר דירה זו',
    showMore: 'הצג עוד',
    showLess: 'הצג פחות',

    // Contact Form
    contactFormEmail: 'אימייל',
    contactFormEmailPlaceholder: 'your@email.com',
    contactFormPhone: 'טלפון',
    contactFormPhonePlaceholder: '054-806-0982',
    contactFormSubmit: 'שליחה',
    contactFormInvalidEmail: 'כתובת אימייל לא תקינה',
    contactFormInvalidPhone: 'מספר טלפון לא תקין',
    contactFormSubmitted: 'שלחתי את הפרטים שלי.',
    marketingOptIn: 'אני מסכים/ה לקבל הודעות שיווקיות',

    // Fattal ID Collect Form
    fattalIdLabel: 'תעודת זהות',
    fattalIdPlaceholder: 'הזן מספר תעודת זהות',
    fattalDeliveryMethod: 'שלח קוד באמצעות',
    fattalDeliverySms: 'SMS',
    fattalDeliveryEmail: 'אימייל',
    fattalSubmitId: 'אמת',
    fattalIdSubmitted: 'שלחתי את הפרטים לאימות.',

    // Fattal OTP Verify Form
    fattalOtpLabel: 'קוד אימות',
    fattalOtpPlaceholder: 'הזן קוד אימות',
    fattalSubmitOtp: 'שלח קוד',
    fattalOtpSubmitted: 'שלחתי את קוד האימות.',

    // Fattal Cancellation Form
    fattalCancelTitle: 'אישור ביטול הזמנה',
    fattalCancelHotel: 'מלון',
    fattalCancelDates: 'תאריכים',
    fattalCancelNights: 'לילות',
    fattalCancelGuests: 'אורחים',
    fattalCancelPlan: 'בסיס אירוח',
    fattalCancelTotal: 'סה״כ',
    fattalCancelOrderId: 'מספר הזמנה',
    fattalCancelConfirm: 'אשר ביטול',
    fattalCancelDecline: 'חזור',
    fattalCancelConfirmed: 'אישרתי את ביטול ההזמנה.',
    fattalCancelDeclined: 'ביטלתי את בקשת הביטול.',

    // Fattal Contact Update Form
    fattalContactUpdateTitle: 'עדכון פרטי קשר',
    fattalContactUpdatePhone: 'טלפון',
    fattalContactUpdateEmail: 'אימייל',
    fattalContactUpdateBirthDate: 'תאריך לידה',
    fattalContactUpdateAnniversary: 'תאריך יום נישואין',
    fattalContactUpdateSpouseBirthDate: 'תאריך לידת בן/בת הזוג',
    fattalContactUpdatePreferredMonth: 'חודש עדיף לחופשה',
    fattalContactUpdateSubmit: 'שמור שינויים',
    fattalContactUpdateSubmitted: 'שלחתי את עדכון פרטי הקשר.',
    fattalContactUpdateLockedTooltip: 'לא ניתן לעדכן ערך קיים. לשינוי יש לפנות לשירות הלקוחות.',

    // Guesty Guest Details Form
    guestyGuestDetailsFirstName: 'שם פרטי',
    guestyGuestDetailsFirstNamePlaceholder: 'ישראל',
    guestyGuestDetailsLastName: 'שם משפחה',
    guestyGuestDetailsLastNamePlaceholder: 'ישראלי',
    guestyGuestDetailsEmail: 'אימייל',
    guestyGuestDetailsEmailPlaceholder: 'your@email.com',
    guestyGuestDetailsPhone: 'טלפון (אופציונלי)',
    guestyGuestDetailsPhonePlaceholder: '054-000-0000',
    guestyGuestDetailsSubmit: 'שלח פרטים',
    guestyGuestDetailsSubmitted: 'שלחתי את פרטי האורח.',
    guestyGuestDetailsInvalidFirstName: 'שם פרטי נדרש',
    guestyGuestDetailsInvalidLastName: 'שם משפחה נדרש',
    guestyGuestDetailsInvalidEmail: 'כתובת אימייל לא תקינה',
    guestyGuestDetailsInvalidPhone: 'מספר טלפון לא תקין',
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

    // Listing Carousel
    availableListings: 'Available Listings',
    moreDetails: 'More Details',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    guests: 'Guests',
    perNight: '/night',
    total: 'total',
    backToListings: 'Back to listings',
    selectListing: 'Select This Listing',
    showMore: 'Show more',
    showLess: 'Show less',

    // Contact Form
    contactFormEmail: 'Email',
    contactFormEmailPlaceholder: 'your@email.com',
    contactFormPhone: 'Phone',
    contactFormPhonePlaceholder: '054-806-0982',
    contactFormSubmit: 'Submit',
    contactFormInvalidEmail: 'Invalid email address',
    contactFormInvalidPhone: 'Invalid phone number',
    contactFormSubmitted: "I've submitted my contact details.",
    marketingOptIn: 'I agree to receive marketing communications',

    // Fattal ID Collect Form
    fattalIdLabel: 'Israeli ID',
    fattalIdPlaceholder: 'Enter your ID number',
    fattalDeliveryMethod: 'Send code via',
    fattalDeliverySms: 'SMS',
    fattalDeliveryEmail: 'Email',
    fattalSubmitId: 'Verify',
    fattalIdSubmitted: "I've submitted my details for verification.",

    // Fattal OTP Verify Form
    fattalOtpLabel: 'Verification Code',
    fattalOtpPlaceholder: 'Enter verification code',
    fattalSubmitOtp: 'Submit Code',
    fattalOtpSubmitted: "I've submitted the verification code.",

    // Fattal Cancellation Form
    fattalCancelTitle: 'Confirm Cancellation',
    fattalCancelHotel: 'Hotel',
    fattalCancelDates: 'Dates',
    fattalCancelNights: 'Nights',
    fattalCancelGuests: 'Guests',
    fattalCancelPlan: 'Meal Plan',
    fattalCancelTotal: 'Total',
    fattalCancelOrderId: 'Order ID',
    fattalCancelConfirm: 'Confirm Cancellation',
    fattalCancelDecline: 'Go Back',
    fattalCancelConfirmed: "I've confirmed the cancellation.",
    fattalCancelDeclined: "I've declined the cancellation.",

    // Fattal Contact Update Form
    fattalContactUpdateTitle: 'Update Contact Details',
    fattalContactUpdatePhone: 'Phone',
    fattalContactUpdateEmail: 'Email',
    fattalContactUpdateBirthDate: 'Date of Birth',
    fattalContactUpdateAnniversary: 'Anniversary Date',
    fattalContactUpdateSpouseBirthDate: "Spouse's Date of Birth",
    fattalContactUpdatePreferredMonth: 'Preferred Vacation Month',
    fattalContactUpdateSubmit: 'Save Changes',
    fattalContactUpdateSubmitted: "I've submitted my contact details update.",
    fattalContactUpdateLockedTooltip: 'This value is on file and cannot be changed here. Contact customer service to update.',

    // Guesty Guest Details Form
    guestyGuestDetailsFirstName: 'First Name',
    guestyGuestDetailsFirstNamePlaceholder: 'John',
    guestyGuestDetailsLastName: 'Last Name',
    guestyGuestDetailsLastNamePlaceholder: 'Smith',
    guestyGuestDetailsEmail: 'Email',
    guestyGuestDetailsEmailPlaceholder: 'your@email.com',
    guestyGuestDetailsPhone: 'Phone (optional)',
    guestyGuestDetailsPhonePlaceholder: '+1-555-000-0000',
    guestyGuestDetailsSubmit: 'Submit Details',
    guestyGuestDetailsSubmitted: "I've submitted my guest details.",
    guestyGuestDetailsInvalidFirstName: 'First name is required',
    guestyGuestDetailsInvalidLastName: 'Last name is required',
    guestyGuestDetailsInvalidEmail: 'Invalid email address',
    guestyGuestDetailsInvalidPhone: 'Invalid phone number',
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
