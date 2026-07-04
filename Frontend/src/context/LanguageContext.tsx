import React, { createContext, useState, useEffect, useContext } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const INDIAN_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
  { code: 'brx', name: 'Bodo', nativeName: 'बोडो' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कश्मीरी' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মণিপুরী' },
  { code: 'lus', name: 'Mizo', nativeName: 'Mizo' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
];

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (langCode: string) => void;
  languages: Language[];
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Sets the googtrans cookie that Google Translate reads on page load.
 * On localhost we only set path=/ since domain= is rejected by browsers for
 * localhost / IP addresses.
 */
const setTranslateCookie = (langCode: string) => {
  const value = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
  document.cookie = `googtrans=${value}; path=/`;
  if (
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)
  ) {
    document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
    const parts = window.location.hostname.split('.');
    if (parts.length >= 2) {
      document.cookie = `googtrans=${value}; path=/; domain=.${parts.slice(-2).join('.')}`;
    }
  }
};

/**
 * PRIMARY: Use the global doGTranslate function that Google Translate
 * exposes. This is the most reliable method — it is what the native
 * widget calls internally when the user picks a language.
 */
const tryDoGTranslate = (langCode: string): boolean => {
  const w = window as any;
  if (typeof w.doGTranslate === 'function') {
    // doGTranslate expects the format 'en|<target>'
    w.doGTranslate(`en|${langCode}`);
    return true;
  }
  return false;
};

/**
 * SECONDARY: Programmatically drive the hidden <select.goog-te-combo> using
 * the native value setter (via Object.getOwnPropertyDescriptor on the
 * HTMLSelectElement prototype). Synthetic events are insufficient — Google
 * Translate's listener requires a native-looking change event.
 */
const trySelectCombo = (langCode: string): boolean => {
  const selectEl = document.querySelector('select.goog-te-combo') as HTMLSelectElement | null;
  if (!selectEl) return false;

  // Use the native setter so the value assignment is observed by React/Vue
  // AND by Google Translate's internal listeners.
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype, 'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(selectEl, langCode);
  } else {
    selectEl.value = langCode;
  }

  // Dispatch both 'input' and 'change' to cover all listener patterns GT uses
  selectEl.dispatchEvent(new Event('input',  { bubbles: true }));
  selectEl.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
};

/**
 * TERTIARY: Cookie + page reload — guaranteed to work but causes full reload.
 * Used only as a final fallback.
 */
const reloadWithLang = (langCode: string) => {
  setTranslateCookie(langCode);
  window.location.reload();
};

/**
 * Master translate trigger — tries each strategy in order.
 * Returns true if a non-reload strategy succeeded.
 */
const applyTranslation = (langCode: string): boolean => {
  // Strategy 1: doGTranslate global
  if (tryDoGTranslate(langCode)) return true;
  // Strategy 2: native select combo
  if (trySelectCombo(langCode)) return true;
  // Strategy 3 (handled by caller): reload
  return false;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>('en');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // On mount: restore persisted language
  useEffect(() => {
    const savedLang = localStorage.getItem('geoharvest_lang') || 'en';
    setCurrentLanguageState(savedLang);

    if (savedLang !== 'en') {
      setIsTranslating(true);
      setTranslateCookie(savedLang);

      // Poll until Google Translate finishes loading its widget into the DOM
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const ok = applyTranslation(savedLang);
        if (ok || attempts > 80) {          // ~8 seconds max
          setIsTranslating(false);
          clearInterval(interval);
          // If still not working after 8 s, fall back to reload
          if (!ok && attempts > 80) {
            reloadWithLang(savedLang);
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, []);

  const setLanguage = (langCode: string) => {
    setIsTranslating(true);
    setCurrentLanguageState(langCode);
    localStorage.setItem('geoharvest_lang', langCode);
    setTranslateCookie(langCode);

    if (langCode === 'en') {
      // Switching back to English: reload is the only reliable way to clear
      // the translation iframe's state without artefacts.
      setTimeout(() => reloadWithLang('en'), 50);
      return;
    }

    // Try immediate apply first
    const ok = applyTranslation(langCode);
    if (ok) {
      setTimeout(() => setIsTranslating(false), 600);
      return;
    }

    // Widget not ready yet — poll for up to 4 seconds, then reload as fallback
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const done = applyTranslation(langCode);
      if (done) {
        setIsTranslating(false);
        clearInterval(interval);
      } else if (attempts > 40) {
        clearInterval(interval);
        // Last resort: set cookie and reload
        reloadWithLang(langCode);
      }
    }, 100);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, languages: INDIAN_LANGUAGES, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
