import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import all translation files
import en from "./locales/en.json";
import zh from "./locales/zh.json";
import ko from "./locales/ko.json";
import ja from "./locales/ja.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import it from "./locales/it.json";

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  ko: { translation: ko },
  ja: { translation: ja },
  de: { translation: de },
  pt: { translation: pt },
  it: { translation: it },
};

// Language display names for the selector
export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文 (Chinese)" },
  { value: "ko", label: "한국어 (Korean)" },
  { value: "ja", label: "日本語 (Japanese)" },
  { value: "de", label: "Deutsch (German)" },
  { value: "pt", label: "Português (Portuguese)" },
  { value: "it", label: "Italiano (Italian)" },
];

try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      debug: false,
      
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      
      detection: {
        // Order of language detection
        order: ["localStorage", "navigator", "htmlTag"],
        // Cache user language selection
        caches: ["localStorage"],
        lookupLocalStorage: "street-champz-language",
      },
    });
} catch (error) {
  console.error("Failed to initialize i18n:", error);
  // Initialize with minimal config if there's an error
  i18n
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en } },
      fallbackLng: "en",
      lng: "en",
    });
}

export default i18n;
