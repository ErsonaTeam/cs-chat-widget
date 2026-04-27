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

export interface WidgetTheme {
  id: string;
  colors: {
    primary: string;
    primaryLight: string;
    accent: string;
    background: string;
    accentLight: string;
  };
  logoUrl: string;
  logoSize: { width: number; height: number };
  direction: "rtl" | "ltr";
  text: Record<Language, WidgetThemeText>;
  welcomeMessage: (name: string) => WelcomeMessage;
}

const HEBREW_RE = /[\u0590-\u05FF]/;
const isHebrew = (s: string) => HEBREW_RE.test(s);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const defaultTheme: WidgetTheme = {
  id: "default",
  colors: {
    primary: "#1A3A5C",
    primaryLight: "#244E75",
    accent: "#2685CB",
    background: "#FFFFFF",
    accentLight: "#EBF5FF",
  },
  logoUrl: "/ersona-logo.svg",
  logoSize: { width: 24, height: 24 },
  direction: "ltr",
  text: {
    EN: {
      welcomeTitle: "Welcome",
      headerTitle: "Chat with us",
      nameLabel: "Please enter your name:",
      namePlaceholder: "Your name...",
      startChat: "Start Chat",
      resetButton: "Reset",
      inputPlaceholder: "Type a message...",
      loadingPlaceholder: "Waiting for reply...",
    },
    HE: {
      welcomeTitle: "ברוכים הבאים",
      headerTitle: "צ׳אט איתנו",
      nameLabel: "נא להזין את שמך:",
      namePlaceholder: "השם שלך...",
      startChat: "התחל צ׳אט",
      resetButton: "איפוס",
      inputPlaceholder: "הקלד הודעה...",
      loadingPlaceholder: "ממתין לתשובה...",
    },
  },
  welcomeMessage: (name) =>
    isHebrew(name)
      ? {
          text: `היי ${name}, ברוכים הבאים!\nאיך נוכל לעזור לך היום?`,
          direction: "rtl",
        }
      : {
          text: `Hi ${capitalize(name)}, welcome!\nHow can we help you today?`,
          direction: "ltr",
        },
};

const fattalTheme: WidgetTheme = {
  id: "fattal",
  colors: {
    primary: "#1d2b4d",
    primaryLight: "#2d3f66",
    accent: "#f0c14b",
    background: "#faf8f5",
    accentLight: "#fff8e1",
  },
  logoUrl: "https://d2nyvxq412w7ra.cloudfront.net/fattal_heart_color_addfa324af.svg",
  logoSize: { width: 24, height: 24 },
  direction: "rtl",
  text: {
    HE: {
      welcomeTitle: "ברוכים הבאים לפתאל",
      headerTitle: "רשת מלונות פתאל",
      nameLabel: "נא להזין את שמך:",
      namePlaceholder: "השם שלך...",
      startChat: "התחל צ׳אט",
      resetButton: "איפוס",
      inputPlaceholder: "הקלד הודעה...",
      loadingPlaceholder: "ממתין לתשובה...",
    },
    EN: {
      welcomeTitle: "Welcome to Fattal",
      headerTitle: "Fattal Hotels",
      nameLabel: "Please enter your name:",
      namePlaceholder: "Your name...",
      startChat: "Start Chat",
      resetButton: "Reset",
      inputPlaceholder: "Type a message...",
      loadingPlaceholder: "Waiting for reply...",
    },
  },
  welcomeMessage: (name) =>
    isHebrew(name)
      ? {
          text: `שלום, ${name}.\nאני יכול לעזור לך לקבל מידע על המלון, לבדוק מחירים וחבילות, לבצע הזמנה חדשה, ולטפל בהזמנה קיימת - כולל ביטול או עדכון פרטים אישיים.`,
          direction: "rtl",
        }
      : {
          text: `Welcome, ${capitalize(name)}.\nI can help you with hotel information, rates and packages, making a new reservation, and handling an existing booking - including cancellations or updating personal details.`,
          direction: "ltr",
        },
};

const eztlvTheme: WidgetTheme = {
  id: "eztlv",
  colors: {
    primary: "#2D6DA4",
    primaryLight: "#3A85C4",
    accent: "#2D6DA4",
    background: "#F5F7FA",
    accentLight: "#E8F0FE",
  },
  logoUrl: "/ez-group.png",
  logoSize: { width: 44, height: 44 },
  direction: "ltr",
  text: {
    EN: {
      welcomeTitle: "Welcome to EZ Group",
      headerTitle: "EZ Group",
      nameLabel: "Please enter your name:",
      namePlaceholder: "Your name...",
      startChat: "Start Chat",
      resetButton: "Reset",
      inputPlaceholder: "Type a message...",
      loadingPlaceholder: "Waiting for reply...",
    },
    HE: {
      welcomeTitle: "ברוכים הבאים ל-EZ Group",
      headerTitle: "EZ Group",
      nameLabel: "נא להזין את שמך:",
      namePlaceholder: "השם שלך...",
      startChat: "התחל צ׳אט",
      resetButton: "איפוס",
      inputPlaceholder: "הקלד הודעה...",
      loadingPlaceholder: "ממתין לתשובה...",
    },
  },
  welcomeMessage: (name) =>
    isHebrew(name)
      ? {
          text: `היי ${name}, ברוכים הבאים ל-EZ Group!\nאני כאן כדי לעזור לך למצוא את הדירה המושלמת ולענות על כל שאלה.`,
          direction: "rtl",
        }
      : {
          text: `Hi ${capitalize(name)}, welcome to EZ Group!\nI'm here to help you find the perfect apartment and answer any questions.`,
          direction: "ltr",
        },
};

export const themes: Record<string, WidgetTheme> = {
  default: defaultTheme,
  fattal: fattalTheme,
  eztlv: eztlvTheme,
};

export const DEFAULT_THEME_ID = "default";

export function getTheme(themeId?: string | null): WidgetTheme {
  if (themeId && themes[themeId]) {
    return themes[themeId];
  }
  return themes[DEFAULT_THEME_ID];
}
