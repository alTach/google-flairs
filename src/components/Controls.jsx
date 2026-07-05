import { clsx } from "clsx";
import { useTransition } from "react";
import { LayoutGrid, List } from "lucide-react";

export function Controls({ searchQuery, onSearchChange, uiStrings, layout, onLayoutChange, globalFormat, onGlobalFormatChange, isAiReady }) {
  return (
    <section className="glass-surface grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 mb-6 p-3 rounded-[28px] overflow-hidden">
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
    </section>
  );
}
