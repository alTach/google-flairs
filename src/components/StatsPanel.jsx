export function StatCard({ label, value }) {
  return (
    <div className="p-[22px_18px] border border-slate-300/70 rounded-[22px] bg-white/90">
      <span className="block text-[clamp(2rem,4vw,3rem)] leading-none font-black tracking-tighter">
        {value}
      </span>
      <span className="block mt-2.5 text-slate-500 text-[0.82rem] font-extrabold uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

export function StatsPanel({ totalCount, visibleCount, groupCount, currentLanguageLabel, uiStrings }) {
  return (
    <aside className="glass-surface grid grid-cols-2 gap-4 p-5 rounded-[28px] relative overflow-hidden">
      <StatCard label={uiStrings.codesTotal} value={totalCount} />
      <StatCard label={uiStrings.cardsVisible} value={visibleCount} />
      <StatCard label={uiStrings.groups} value={groupCount} />
      <StatCard label={uiStrings.language} value={currentLanguageLabel} />
    </aside>
  );
}
