"use client";

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

export function FlairCard({ item, uiStrings, currentFormat, onFormatChange, onImageOpen, onCopy }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMediaReady, setIsMediaReady] = useState(false);

  const category = item.category;
  
  const getImageUrl = (code, format) => {
    return format === "svg" 
      ? `https://ssl.gstatic.com/calendar/images/eventillustrations/2024_v2/img_${code}.svg`
      : `https://ssl.gstatic.com/tmly/f8944938hffheth4ew890ht4i8/flairs/xxhdpi/img_${code}.jpg`;
  };

  const imageSource = getImageUrl(item.image, currentFormat);

  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy(item.uiShortest);
  };

  const togglePanel = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const handleCardClick = () => {
    if (isExpanded) return;
    onImageOpen(getImageUrl(item.image, currentFormat), item.uiShortest);
  };

  return (
    <article
      onClick={handleCardClick}
      className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-slate-300/70 shadow-[0_20px_44px_rgba(15,23,42,0.14)] bg-gradient-to-br from-slate-200/95 to-slate-100/95 transition-all hover:-translate-y-1 content-visibility-auto contain-intrinsic-size-[320px]"
      style={{ borderColor: `color-mix(in srgb, ${category.color} 24%, #cbd5e1)` }}
    >

      
      <img
        src={imageSource}
        alt={item.uiShortest}
        loading="lazy"
        decoding="async"
        className={clsx("cursor-pointer absolute inset-0 w-full h-full object-cover transition-opacity duration-180")}
      />
      <span className="absolute inset-0 bg-gradient-to-b from-slate-900/5 to-slate-900/30 pointer-events-none"></span>

      <div className="absolute top-3 right-3 z-10 inline-grid grid-cols-2 gap-1 p-1 rounded-full bg-slate-900/75">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFormatChange(item.key, "svg"); }}
          className={clsx(
            "inline-flex items-center justify-center min-w-[48px] px-2.5 py-1.5 rounded-full text-[0.72rem] font-black uppercase tracking-widest transition-colors",
            currentFormat === "svg" ? "bg-white/15 text-white opacity-100" : "bg-transparent text-white opacity-70 hover:opacity-100"
          )}
        >
          svg
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFormatChange(item.key, "img"); }}
          className={clsx(
            "inline-flex items-center justify-center min-w-[48px] px-2.5 py-1.5 rounded-full text-[0.72rem] font-black uppercase tracking-widest transition-colors",
            currentFormat === "img" ? "bg-white/15 text-white opacity-100" : "bg-transparent text-white opacity-70 hover:opacity-100"
          )}
        >
          img
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-2.5 p-5.5 text-white pointer-events-none">
        <div className="flex items-center justify-between gap-3 pointer-events-auto">
           <div className="flex items-center gap-2.5">
             <button
               onClick={handleCopy}
               className="inline-flex items-center w-fit px-3.5 py-2.5 rounded-full bg-white/95 text-slate-900 text-[0.78rem] font-black hover:bg-white transition-colors"
             >
               {item.uiShortest}
             </button>
             <button
               type="button"
               onClick={togglePanel}
               className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-full bg-white/15 text-white text-[0.72rem] font-black uppercase tracking-widest border-0 hover:bg-white/20 transition-colors"
             >
               +{item.uiCount}
             </button>
           </div>
        </div>
      </div>

      <div className={clsx(
        "absolute inset-0 z-50 flex flex-col justify-end gap-3 p-5.5 text-white transition-opacity duration-180 bg-cover bg-center",
        isExpanded ? "opacity-100" : "opacity-0 hidden"
      )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-white/20"></div>
        <button
          type="button"
          onClick={togglePanel}
          className="absolute top-3.5 right-3.5 z-30 w-10 h-10 rounded-full bg-white/75 text-black text-2xl leading-none flex border-none items-center justify-center hover:bg-white/90 transition-colors cursor-pointer"
        >
          ×
        </button>
        <p className="relative z-10 m-0 text-white/90 text-[0.9rem] leading-[1.45]">
          {uiStrings.revealHint}
        </p>
        <p className="relative z-10 m-0 text-[0.82rem] font-black uppercase tracking-widest text-white/75">
          {uiStrings.associationsTitle}
        </p>
        <p className="relative z-10 m-0 text-[0.96rem] leading-[1.6] max-h-[10.4rem] overflow-y-auto">
          {item.uiWords}
        </p>
      </div>
    </article>
  );
}
