import { clsx } from "clsx";
import { useTransition } from "react";
import { LayoutGrid, List } from "lucide-react";

export function Controls({ searchQuery, onSearchChange, language, onLanguageChange, languageOptions, uiStrings, isTranslating, layout, onLayoutChange, globalFormat, onGlobalFormatChange }) {
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (e) => {
    startTransition(() => {
      onLanguageChange(e.target.value);
    });
  };

  return (
    <section className="glass-surface sticky top-3 z-20 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] gap-3 mb-6 p-3 rounded-[28px] overflow-hidden">
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

      <div className="flex gap-3 w-full sm:w-auto">
        <div className="flex flex-1 sm:flex-none bg-white/90 border border-slate-300/80 rounded-[18px] p-1 h-[54px]">
          <button
            onClick={() => onLayoutChange('grid')}
            className={clsx("flex flex-1 sm:flex-none items-center justify-center sm:w-12 h-full rounded-[14px] transition-colors cursor-pointer", layout === 'grid' ? "bg-slate-200" : "hover:bg-slate-100")}
            title="Grid view"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => onLayoutChange('list')}
            className={clsx("flex flex-1 sm:flex-none items-center justify-center sm:w-12 h-full rounded-[14px] transition-colors cursor-pointer", layout === 'list' ? "bg-slate-200" : "hover:bg-slate-100")}
            title="List view"
          >
            <List size={20} />
          </button>
        </div>

        <div className="flex flex-1 sm:flex-none bg-white/90 border border-slate-300/80 rounded-[18px] p-1 h-[54px] font-black uppercase text-[0.75rem] tracking-widest text-slate-700">
          <button
            onClick={() => onGlobalFormatChange('svg')}
            className={clsx("flex flex-1 sm:flex-none items-center justify-center sm:w-14 h-full rounded-[14px] transition-colors cursor-pointer", globalFormat === 'svg' ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100")}
            title="Global SVG"
          >
            SVG
          </button>
          <button
            onClick={() => onGlobalFormatChange('img')}
            className={clsx("flex flex-1 sm:flex-none items-center justify-center sm:w-14 h-full rounded-[14px] transition-colors cursor-pointer", globalFormat === 'img' ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100")}
            title="Global IMG"
          >
            IMG
          </button>
        </div>
      </div>
      
      {/* Loading Progress Bar */}
      <div className={clsx("absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 overflow-hidden transition-opacity duration-300 pointer-events-none", isTranslating ? "opacity-100" : "opacity-0")}>
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-blue-500 animate-progress origin-left"></div>
      </div>
    </section>
  );
}
