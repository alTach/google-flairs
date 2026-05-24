import { clsx } from "clsx";
import { useTransition } from "react";

export function Controls({ searchQuery, onSearchChange, language, onLanguageChange, languageOptions, uiStrings, isTranslating }) {
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (e) => {
    startTransition(() => {
      onLanguageChange(e.target.value);
    });
  };

  return (
    <section className="glass-surface sticky top-3 z-20 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 mb-6 p-3 rounded-[28px] overflow-hidden">
      <label className="sr-only" htmlFor="search">Search</label>
      <input
        id="search"
        type="search"
        placeholder={uiStrings.search}
        autoComplete="off"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="min-h-[54px] px-[18px] border border-slate-300/80 rounded-[18px] bg-white/90 text-slate-900 focus:outline-none focus:ring-[4px] focus:ring-blue-600/15 focus:border-blue-600/50 transition-all font-inherit"
      />
      
      <label className="sr-only" htmlFor="language">Language</label>
      <select
        id="language"
        title={uiStrings.translatorHint || "Language"}
        value={language}
        onChange={handleLanguageChange}
        disabled={isPending}
        className="min-h-[54px] px-[18px] border border-slate-300/80 rounded-[18px] bg-white/90 text-slate-900 focus:outline-none focus:ring-[4px] focus:ring-blue-600/15 focus:border-blue-600/50 transition-all font-inherit disabled:opacity-50"
      >
        {languageOptions.map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
      
      {/* Loading Progress Bar */}
      <div className={clsx("absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 overflow-hidden transition-opacity duration-300 pointer-events-none", isTranslating ? "opacity-100" : "opacity-0")}>
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-blue-500 animate-progress origin-left"></div>
      </div>
    </section>
  );
}
