import { clsx } from "clsx";
import { useTransition } from "react";

export function Footer({ language, onLanguageChange, languageOptions, uiStrings, isTranslating }) {
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (e) => {
    startTransition(() => {
      onLanguageChange(e.target.value);
    });
  };

  const selectedLabel = languageOptions.find(([code]) => code === language)?.[1] || language;

  return (
    <footer className="mt-10 py-6 border-t border-slate-300/50 flex justify-end">
      <div className="relative inline-flex items-center gap-1.5 text-slate-600 font-medium text-[0.9rem]">
        <label htmlFor="footer-language">{uiStrings.translatorHint || "Language"}:</label>
        
        <div className="relative cursor-pointer">
          <span className={clsx("underline decoration-slate-400 underline-offset-4 transition-opacity", isPending && "opacity-50")}>
            {selectedLabel}
          </span>
          <select
            id="footer-language"
            value={language}
            onChange={handleLanguageChange}
            disabled={isPending}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {languageOptions.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Loading Progress Bar */}
        <div className={clsx("absolute -bottom-2 left-0 right-0 h-[2px] bg-slate-200/50 overflow-hidden transition-opacity duration-300 pointer-events-none rounded", isTranslating ? "opacity-100" : "opacity-0")}>
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-blue-500 animate-progress origin-left"></div>
        </div>
      </div>
    </footer>
  );
}
