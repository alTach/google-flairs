import { getFlairsForLanguage, getLanguageOptions } from "./lib/data.js";
import { FlareBrowser } from "./components/FlareBrowser.jsx";

export function App() {
  // Execute data fetching synchronously since this runs in Node server or at build time
  const flairs = getFlairsForLanguage("en");
  const languages = getLanguageOptions();
  
  return (
    <main className="w-[min(1200px,calc(100%-32px))] mx-auto py-10 pb-14">
      <FlareBrowser initialFlairs={flairs} languages={languages} />
    </main>
  );
}
