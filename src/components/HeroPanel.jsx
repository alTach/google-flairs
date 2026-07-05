"use client";

import { Info } from "lucide-react";

export function HeroPanel({ uiStrings }) {
  return (
    <div className="glass-surface relative overflow-hidden p-8 rounded-[28px]">
      <div className="flex flex-wrap gap-2">
        <div className="flex rounded-full text-xs font-extrabold uppercase tracking-widest py-2 px-3.5 bg-blue-100/90 text-blue-600">
        <Info className="w-4 h-4 mr-1" />
        {uiStrings.sourceSnapshot}
      </div>
      <div className="flex rounded-full text-xs font-extrabold uppercase tracking-widest py-2 px-3.5 bg-blue-100/80 text-blue-700">
        {uiStrings.eyebrow}
      </div>
      </div>
      <h1 className="m-0 text-[clamp(3rem,6vw,5rem)] leading-[0.92] font-black tracking-tighter">
        {uiStrings.title}
      </h1>
      <p className="max-w-[44rem] mt-5 mb-0 text-slate-600 text-[1.05rem] leading-[1.8]">
        {uiStrings.lead}
      </p>
    </div>
  );
}
