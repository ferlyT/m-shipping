import { Loader2 } from "lucide-react";
import { useLanguage } from "../locales/LanguageContext";

export function LoadingSpinner() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-in fade-in duration-700">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute h-16 w-16 border-4 border-primary/10 rounded-full border-t-primary/30 animate-spin transition-all duration-1000" />
        
        {/* Middle Pulse */}
        <div className="absolute h-10 w-10 bg-primary/5 rounded-full animate-ping" />
        
        {/* Core Spinner */}
        <Loader2 className="h-8 w-8 text-primary animate-spin relative z-10 duration-700" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="label-md font-bold text-on-surface uppercase tracking-[0.2em] animate-pulse">
            {t("common.loading")}
        </p>
        <div className="h-0.5 w-12 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full w-full bg-primary origin-left animate-progress-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
