import React from "react";
import { useLanguage } from "../locales/LanguageContext";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-surface-container-low p-1 rounded-full border border-on-surface/5">
      <button
        onClick={() => setLanguage("id")}
        className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
          language === "id" 
            ? "bg-primary text-white shadow-soft" 
            : "text-on-surface-variant hover:text-on-surface"
        )}
      >
        ID
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
          language === "en" 
            ? "bg-primary text-white shadow-soft" 
            : "text-on-surface-variant hover:text-on-surface"
        )}
      >
        EN
      </button>
    </div>
  );
}
