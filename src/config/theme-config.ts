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
  text: {
    welcomeTitle: string;
    headerTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    startChat: string;
    resetButton: string;
    inputPlaceholder: string;
    loadingPlaceholder: string;
  };
  welcomeMessages: {
    first: (name: string) => string;
    firstDirection: "ltr" | "rtl";
    second: string;
    secondDirection: "ltr" | "rtl";
  };
}

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
    welcomeTitle: "ברוכים הבאים לפתאל",
    headerTitle: "רשת מלונות פתאל",
    nameLabel: "נא להזין את שמך:",
    namePlaceholder: "השם שלך...",
    startChat: "התחל צ׳אט",
    resetButton: "איפוס",
    inputPlaceholder: "הקלד הודעה...",
    loadingPlaceholder: "ממתין לתשובה...",
  },
  welcomeMessages: {
    first: (name: string) =>
      `היי ${name.charAt(0).toUpperCase() + name.slice(1)} ברוכים הבאים!\n אני כאן כדי לעזור בביצוע הזמנה ולענות כל כל שאלה.`,
    firstDirection: "rtl",
    second:
      "Just for you to know, we can serve you in your preferred language or any language of your choice.",
    secondDirection: "ltr",
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
    welcomeTitle: "Welcome to EZ Group",
    headerTitle: "EZ Group",
    nameLabel: "Please enter your name:",
    namePlaceholder: "Your name...",
    startChat: "Start Chat",
    resetButton: "Reset",
    inputPlaceholder: "Type a message...",
    loadingPlaceholder: "Waiting for reply...",
  },
  welcomeMessages: {
    first: (name: string) =>
      `Hi ${name.charAt(0).toUpperCase() + name.slice(1)}, welcome!\nI'm here to help you find the perfect apartment and answer any questions.`,
    firstDirection: "ltr",
    second:
      "Feel free to ask in any language you prefer — we're happy to help!",
    secondDirection: "ltr",
  },
};

export const themes: Record<string, WidgetTheme> = {
  fattal: fattalTheme,
  eztlv: eztlvTheme,
};

export const DEFAULT_THEME_ID = "fattal";

export function getTheme(themeId?: string | null): WidgetTheme {
  if (themeId && themes[themeId]) {
    return themes[themeId];
  }
  return themes[DEFAULT_THEME_ID];
}
