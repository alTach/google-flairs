"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { HeroPanel } from "./HeroPanel";
import { StatsPanel } from "./StatsPanel";
import { Controls } from "./Controls";
import { Filters } from "./Filters";
import { FlairCard } from "./FlairCard";
import { ImageDialog } from "./ImageDialog";
import { UI, categoryRules, categories } from "@/lib/constants";
import { clsx } from "clsx";
import { getFlairsForLanguage, detectLanguage } from "@/lib/data";
import { translateUiStrings, translateCategories } from "@/lib/translator";

export function FlareBrowser({ initialFlairs, languages }) {
  const [language, setLanguage] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [layout, setLayout] = useState("grid");
  const [globalFormat, setGlobalFormat] = useState("svg");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const defaultLang = detectLanguage(languages);
    if (defaultLang !== "en") {
      setLanguage(defaultLang);
    }
  }, []);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogImage, setDialogImage] = useState({ src: "", alt: "" });
  const [formats, setFormats] = useState({});

  const [uiStrings, setUiStrings] = useState(UI.en);
  const [displayCategories, setDisplayCategories] = useState(categories);
  const [isTranslating, setIsTranslating] = useState(false);

  const flairs = useMemo(() => getFlairsForLanguage(language), [language]);

  useEffect(() => {
    let active = true;

    if (language === 'en') {
      setUiStrings(UI.en);
      setDisplayCategories(categories);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);

    (async () => {
      const newUi = await translateUiStrings(language);
      const newCategories = await translateCategories(language);
      if (active) {
        setUiStrings(newUi);
        setDisplayCategories(newCategories);
        setIsTranslating(false);
      }
    })();
    return () => { active = false; };
  }, [language]);

  const filteredFlairs = useMemo(() => {
    return flairs.filter(item => {
      if (category !== "all" && item.category.key !== category) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.uiSearch.includes(q);
      }
      return true;
    });
  }, [flairs, category, searchQuery]);

  const handleFormatChange = useCallback((key, format) => {
    setFormats(prev => ({ ...prev, [key]: format }));
  }, []);

  const handleGlobalFormatChange = useCallback((format) => {
    setGlobalFormat(format);
    setFormats({}); // Clear individual overrides so all cards switch
  }, []);

  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${uiStrings.copied}: ${text}`);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      showToast(`${uiStrings.copied}: ${text}`);
    }
  }, [uiStrings]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 1200);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-6 mb-6">
        <HeroPanel uiStrings={uiStrings} />
        <StatsPanel
          totalCount={flairs.length}
          visibleCount={filteredFlairs.length}
          groupCount={languages.length}
          currentLanguageLabel={language.toUpperCase()}
          uiStrings={uiStrings}
        />
      </div>

      <Controls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        language={language}
        onLanguageChange={setLanguage}
        languageOptions={languages}
        uiStrings={uiStrings}
        isTranslating={isTranslating}
        layout={layout}
        onLayoutChange={setLayout}
        globalFormat={globalFormat}
        onGlobalFormatChange={handleGlobalFormatChange}
      />

      <Filters
        activeCategory={category}
        onCategoryChange={setCategory}
        categories={displayCategories}
      />

      <section className={clsx(
        "grid gap-4.5",
        layout === "grid" ? "grid-cols-[repeat(auto-fill,minmax(350px,1fr))]" : "grid-cols-1"
      )} aria-live="polite">
        {filteredFlairs.map((item) => (
          <FlairCard
            key={item.key}
            item={item}
            uiStrings={uiStrings}
            currentFormat={formats[item.key] || globalFormat}
            onFormatChange={handleFormatChange}
            onImageOpen={(src, alt) => {
              setDialogImage({ src, alt });
              setDialogOpen(true);
            }}
            onCopy={handleCopy}
          />
        ))}
        {filteredFlairs.length === 0 && (
          <div className="col-span-full p-7 border border-dashed border-slate-400/70 rounded-[28px] bg-white/80 text-slate-600 text-center">
            {uiStrings.empty}
          </div>
        )}
      </section>

      <div className={clsx(
        "fixed left-1/2 bottom-6 z-50 px-4 py-3 rounded-[18px] bg-slate-950 text-white text-[0.84rem] font-extrabold pointer-events-none transition-all duration-180",
        toastMessage ? "opacity-100 translate-x-[-50%] translate-y-0" : "opacity-0 translate-x-[-50%] translate-y-4"
      )}>
        {toastMessage}
      </div>

      <ImageDialog
        isOpen={dialogOpen}
        src={dialogImage.src}
        alt={dialogImage.alt}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
