import React, { createContext, useContext, useState, useEffect } from "react";
import { en, id } from "./translations";

type Language = "en" | "id";
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (path: string) => {
    const keys = path.split(".");
    let result: any = language === "en" ? en : id;
    
    for (const key of keys) {
      if (result[key] === undefined) {
        console.warn(`Translation key not found: ${path}`);
        return path;
      }
      result = result[key];
    }
    
    return result as string;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
