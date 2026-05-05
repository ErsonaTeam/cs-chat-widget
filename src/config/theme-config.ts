import type { Language } from "@/utils/i18n";

export interface WelcomeMessage {
  text: string;
  direction: "ltr" | "rtl";
}

export interface WidgetThemeText {
  welcomeTitle: string;
  headerTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  startChat: string;
  resetButton: string;
  inputPlaceholder: string;
  loadingPlaceholder: string;
}

export interface WidgetThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  primaryLight: string;
  accentLight: string;
}

export interface WidgetTheme {
  id: string;
  displayName: string;
  defaultDirection: 'rtl' | 'ltr';
  colors: WidgetThemeColors;
  logoUrl: string | null;
  defaultIcon: 'concierge-bell';
  logoSize: { width: number; height: number };
  backgroundImageUrl: string | null;
  defaultBackgroundTreatment: string;
  text: Record<Language, WidgetThemeText>;
  welcomeMessage: (name: string) => WelcomeMessage;
}

const HEBREW_RE = /[֐-׿]/;
const isHebrew = (s: string) => HEBREW_RE.test(s);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const defaultTheme: WidgetTheme = {
  id: 'default',
  displayName: 'Default',
  defaultDirection: 'ltr',
  colors: {
    primary: '#1A3A5C',
    primaryLight: '#244E75',
    secondary: '#244E75',
    accent: '#2685CB',
    accentLight: '#EBF5FF',
    background: '#F8F7F3',
    surface: '#FFFFFF',
    text: '#0E1726',
    border: '#D9E1EA',
  },
  logoUrl: '/ersona-logo.svg',
  defaultIcon: 'concierge-bell',
  logoSize: { width: 24, height: 24 },
  backgroundImageUrl: null,
  defaultBackgroundTreatment:
    'linear-gradient(135deg, #1A3A5C 0%, #244E75 60%, #2685CB 100%)',
  text: {
    EN: {
      welcomeTitle: 'Welcome',
      headerTitle: 'Chat with us',
      nameLabel: 'Please enter your name:',
      namePlaceholder: 'Your name...',
      startChat: 'Start Chat',
      resetButton: 'Reset',
      inputPlaceholder: 'Type a message...',
      loadingPlaceholder: 'Waiting for reply...',
    },
    HE: {
      welcomeTitle: 'ברוכים הבאים',
      headerTitle: 'צ׳אט איתנו',
      nameLabel: 'נא להזין את שמך:',
      namePlaceholder: 'השם שלך...',
      startChat: 'התחל צ׳אט',
      resetButton: 'איפוס',
      inputPlaceholder: 'הקלד הודעה...',
      loadingPlaceholder: 'ממתין לתשובה...',
    },
  },
  welcomeMessage: (name) =>
    isHebrew(name)
      ? {
          text: `היי ${name}, ברוכים הבאים!\nאיך נוכל לעזור לך היום?`,
          direction: 'rtl',
        }
      : {
          text: `Hi ${capitalize(name)}, welcome!\nHow can we help you today?`,
          direction: 'ltr',
        },
};

const fattalTheme: WidgetTheme = {
  id: 'fattal',
  displayName: 'Fattal Hotels',
  defaultDirection: 'rtl',
  colors: {
    primary: '#1d2b4d',
    primaryLight: '#2d3f66',
    secondary: '#2d3f66',
    accent: '#f0c14b',
    accentLight: '#fff8e1',
    background: '#faf8f5',
    surface: '#FFFFFF',
    text: '#1d2b4d',
    border: '#E5DCC4',
  },
  logoUrl:
    'https://d2nyvxq412w7ra.cloudfront.net/fattal_heart_color_addfa324af.svg',
  defaultIcon: 'concierge-bell',
  logoSize: { width: 24, height: 24 },
  backgroundImageUrl: null,
  defaultBackgroundTreatment:
    'linear-gradient(135deg, #1d2b4d 0%, #2d3f66 50%, #f0c14b 100%)',
  text: {
    HE: {
      welcomeTitle: 'ברוכים הבאים לפתאל',
      headerTitle: 'רשת מלונות פתאל',
      nameLabel: 'נא להזין את שמך:',
      namePlaceholder: 'השם שלך...',
      startChat: 'התחל צ׳אט',
      resetButton: 'איפוס',
      inputPlaceholder: 'הקלד הודעה...',
      loadingPlaceholder: 'ממתין לתשובה...',
    },
    EN: {
      welcomeTitle: 'Welcome to Fattal',
      headerTitle: 'Fattal Hotels',
      nameLabel: 'Please enter your name:',
      namePlaceholder: 'Your name...',
      startChat: 'Start Chat',
      resetButton: 'Reset',
      inputPlaceholder: 'Type a message...',
      loadingPlaceholder: 'Waiting for reply...',
    },
  },
  welcomeMessage: (name) =>
    isHebrew(name)
      ? {
          text: `שלום, ${name}.\nאני יכול לעזור לך לקבל מידע על המלון, לבדוק מחירים וחבילות, לבצע הזמנה חדשה, ולטפל בהזמנה קיימת - כולל ביטול או עדכון פרטים אישיים.`,
          direction: 'rtl',
        }
      : {
          text: `Welcome, ${capitalize(name)}.\nI can help you with hotel information, rates and packages, making a new reservation, and handling an existing booking - including cancellations or updating personal details.`,
          direction: 'ltr',
        },
};

const eztlvTheme: WidgetTheme = {
  id: 'eztlv',
  displayName: 'EZ Group',
  defaultDirection: 'ltr',
  colors: {
    primary: '#2D6DA4',
    primaryLight: '#3A85C4',
    secondary: '#3A85C4',
    accent: '#2D6DA4',
    accentLight: '#E8F0FE',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#14323A',
    border: '#D5E4F0',
  },
  logoUrl: '/ez-group.png',
  defaultIcon: 'concierge-bell',
  logoSize: { width: 44, height: 44 },
  backgroundImageUrl: null,
  defaultBackgroundTreatment:
    'linear-gradient(135deg, #2D6DA4 0%, #3A85C4 50%, #5BC0EB 100%)',
  text: {
    EN: {
      welcomeTitle: 'Welcome to EZ Group',
      headerTitle: 'EZ Group',
      nameLabel: 'Please enter your name:',
      namePlaceholder: 'Your name...',
      startChat: 'Start Chat',
      resetButton: 'Reset',
      inputPlaceholder: 'Type a message...',
      loadingPlaceholder: 'Waiting for reply...',
    },
    HE: {
      welcomeTitle: 'ברוכים הבאים ל-EZ Group',
      headerTitle: 'EZ Group',
      nameLabel: 'נא להזין את שמך:',
      namePlaceholder: 'השם שלך...',
      startChat: 'התחל צ׳אט',
      resetButton: 'איפוס',
      inputPlaceholder: 'הקלד הודעה...',
      loadingPlaceholder: 'ממתין לתשובה...',
    },
  },
  welcomeMessage: (name) =>
    isHebrew(name)
      ? {
          text: `היי ${name}, ברוכים הבאים ל-EZ Group!\nאני כאן כדי לעזור לך למצוא את הדירה המושלמת ולענות על כל שאלה.`,
          direction: 'rtl',
        }
      : {
          text: `Hi ${capitalize(name)}, welcome to EZ Group!\nI'm here to help you find the perfect apartment and answer any questions.`,
          direction: 'ltr',
        },
};

const urbanTheme: WidgetTheme = {
  id: 'urban',
  displayName: 'Urban / Boutique',
  defaultDirection: 'ltr',
  colors: {
    primary: '#0F2747',
    primaryLight: '#274C77',
    secondary: '#274C77',
    accent: '#D6A85F',
    accentLight: '#F2E5CC',
    background: '#F8F7F3',
    surface: '#FFFFFF',
    text: '#0E1726',
    border: '#D9E1EA',
  },
  logoUrl: null,
  defaultIcon: 'concierge-bell',
  logoSize: { width: 28, height: 28 },
  backgroundImageUrl: null,
  defaultBackgroundTreatment:
    'linear-gradient(135deg, #0F2747 0%, #1A3A5C 60%, #274C77 100%)',
  text: {
    HE: {
      welcomeTitle: 'ברוכים הבאים',
      headerTitle: 'צ׳אט איתנו',
      nameLabel: 'נא להזין את שמך',
      namePlaceholder: 'השם שלך...',
      startChat: 'התחל צ׳אט',
      resetButton: 'איפוס',
      inputPlaceholder: 'הקלד הודעה...',
      loadingPlaceholder: 'ממתין לתשובה...',
    },
    EN: {
      welcomeTitle: 'Welcome',
      headerTitle: 'Chat with us',
      nameLabel: 'Please enter your name',
      namePlaceholder: 'Your name...',
      startChat: 'Start Chat',
      resetButton: 'Reset',
      inputPlaceholder: 'Type a message...',
      loadingPlaceholder: 'Waiting for reply...',
    },
  },
  welcomeMessage: (name) =>
    isHebrew(name)
      ? {
          text: `היי ${name}, ברוכים הבאים! איך נוכל לעזור לך היום?`,
          direction: 'rtl',
        }
      : {
          text: `Hi ${capitalize(name)}, welcome! How can we help you today?`,
          direction: 'ltr',
        },
};

const resortTheme: WidgetTheme = {
  id: 'resort',
  displayName: 'Resort / Coastal',
  defaultDirection: 'ltr',
  colors: {
    primary: '#1F9AA8',
    primaryLight: '#5BC0EB',
    secondary: '#5BC0EB',
    accent: '#D9B26F',
    accentLight: '#DFF4F1',
    background: '#FAFCFB',
    surface: '#FFFFFF',
    text: '#14323A',
    border: '#D5E8E8',
  },
  logoUrl: null,
  defaultIcon: 'concierge-bell',
  logoSize: { width: 28, height: 28 },
  backgroundImageUrl: null,
  defaultBackgroundTreatment:
    'linear-gradient(135deg, #DFF4F1 0%, #5BC0EB 50%, #1F9AA8 100%)',
  text: {
    HE: {
      welcomeTitle: 'ברוכים הבאים',
      headerTitle: 'צ׳אט איתנו',
      nameLabel: 'נא להזין את שמך',
      namePlaceholder: 'השם שלך...',
      startChat: 'התחל צ׳אט',
      resetButton: 'איפוס',
      inputPlaceholder: 'הקלד הודעה...',
      loadingPlaceholder: 'ממתין לתשובה...',
    },
    EN: {
      welcomeTitle: 'Welcome',
      headerTitle: 'Chat with us',
      nameLabel: 'Please enter your name',
      namePlaceholder: 'Your name...',
      startChat: 'Start Chat',
      resetButton: 'Reset',
      inputPlaceholder: 'Type a message...',
      loadingPlaceholder: 'Waiting for reply...',
    },
  },
  welcomeMessage: (name) =>
    isHebrew(name)
      ? {
          text: `היי ${name}, ברוכים הבאים! איך נוכל לעזור לך היום?`,
          direction: 'rtl',
        }
      : {
          text: `Hi ${capitalize(name)}, welcome! How can we help you today?`,
          direction: 'ltr',
        },
};

const luxuryTheme: WidgetTheme = {
  id: 'luxury',
  displayName: 'Classic Luxury',
  defaultDirection: 'ltr',
  colors: {
    primary: '#5B0F1B',
    primaryLight: '#7A1F2B',
    secondary: '#7A1F2B',
    accent: '#D4AF6A',
    accentLight: '#F2E2C2',
    background: '#FAF6F0',
    surface: '#FFFDFC',
    text: '#2C1A15',
    border: '#E7D8C7',
  },
  logoUrl: null,
  defaultIcon: 'concierge-bell',
  logoSize: { width: 28, height: 28 },
  backgroundImageUrl: null,
  defaultBackgroundTreatment:
    'linear-gradient(135deg, #FAF6F0 0%, #D4AF6A 50%, #5B0F1B 100%)',
  text: {
    HE: {
      welcomeTitle: 'ברוכים הבאים',
      headerTitle: 'צ׳אט איתנו',
      nameLabel: 'נא להזין את שמך',
      namePlaceholder: 'השם שלך...',
      startChat: 'התחל צ׳אט',
      resetButton: 'איפוס',
      inputPlaceholder: 'הקלד הודעה...',
      loadingPlaceholder: 'ממתין לתשובה...',
    },
    EN: {
      welcomeTitle: 'Welcome',
      headerTitle: 'Chat with us',
      nameLabel: 'Please enter your name',
      namePlaceholder: 'Your name...',
      startChat: 'Start Chat',
      resetButton: 'Reset',
      inputPlaceholder: 'Type a message...',
      loadingPlaceholder: 'Waiting for reply...',
    },
  },
  welcomeMessage: (name) =>
    isHebrew(name)
      ? {
          text: `היי ${name}, ברוכים הבאים! איך נוכל לעזור לך היום?`,
          direction: 'rtl',
        }
      : {
          text: `Hi ${capitalize(name)}, welcome! How can we help you today?`,
          direction: 'ltr',
        },
};

export const themes: Record<string, WidgetTheme> = {
  default: defaultTheme,
  fattal: fattalTheme,
  eztlv: eztlvTheme,
  urban: urbanTheme,
  resort: resortTheme,
  luxury: luxuryTheme,
};

export const DEFAULT_THEME_ID = 'urban';

export function getTheme(themeId?: string | null): WidgetTheme {
  if (themeId && themes[themeId]) {
    return themes[themeId];
  }
  return themes[DEFAULT_THEME_ID];
}
