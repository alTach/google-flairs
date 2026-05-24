import { getFlairsForLanguage, getLanguageOptions } from "@/lib/data";
import { FlareBrowser } from "@/components/FlareBrowser";

export default function Page() {
  const flairs = getFlairsForLanguage("en");
  const languages = getLanguageOptions();
  
  return (
    <main className="w-[min(1200px,calc(100%-32px))] mx-auto py-10 pb-14">
      <FlareBrowser initialFlairs={flairs} languages={languages} />
    </main>
  );
}
