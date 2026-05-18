import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import pugPlugin from "vite-plugin-pug";
import { UI, categories, categoryRules } from "./src/scripts/constants.js";

const dataDir = path.resolve("src/data");

function parseLanguageEntries(payload) {
  return payload?.[0]?.[1] ?? [];
}

function getLanguageCode(filename) {
  return filename.replace(".json", "");
}

function getLanguageLabel(code) {
  try {
    const display = new Intl.DisplayNames(["en"], { type: "language" });
    return display.of(code) || code;
  } catch {
    return code;
  }
}

function sortLanguageCodes(a, b) {
  if (a === "en") return -1;
  if (b === "en") return 1;
  if (a === "ru") return -1;
  if (b === "ru") return 1;
  return a.localeCompare(b);
}

function svgUrl(code) {
  return `https://ssl.gstatic.com/calendar/images/eventillustrations/2024_v2/img_${code}.svg`;
}

function jpgUrl(code) {
  return `https://ssl.gstatic.com/tmly/f8944938hffheth4ew890ht4i8/flairs/xxhdpi/img_${code}.jpg`;
}

function getShortestAssociation(associations, fallback) {
  return [...associations]
    .sort((a, b) => a.text.length - b.text.length || a.text.localeCompare(b.text))
    .at(0)?.text || fallback;
}

const englishPayload = JSON.parse(fs.readFileSync(path.join(dataDir, "en.json"), "utf8"));
const englishEntries = parseLanguageEntries(englishPayload);

const flairItems = englishEntries
  .map(([code, associations]) => {
    const associationsEn = associations.map(([weight, text]) => ({
      weight,
      text: String(text).trim()
    }));
    const shortestEn = getShortestAssociation(associationsEn, code);

    return {
      key: code,
      code,
      image: code,
      associationsEn,
      shortestEn,
      countEn: associationsEn.length,
      wordsEn: associationsEn.map(({ text }) => text).join(", "),
      searchEn: [code, ...associationsEn.map(({ text }) => text)].join(" ").toLowerCase()
    };
  })
  .sort((a, b) => a.shortestEn.localeCompare(b.shortestEn));

function getCategory(item) {
  const haystack = [item.code, ...item.associationsEn.map(({ text }) => text)].join(" ");
  return categoryRules.find((rule) => rule.match.test(haystack)) || categoryRules.at(-1);
}

const languageOptions = fs
  .readdirSync(dataDir)
  .filter((name) => name.endsWith(".json"))
  .map(getLanguageCode)
  .sort(sortLanguageCodes)
  .map((code) => [code, getLanguageLabel(code)]);

export default defineConfig({
  plugins: [
    tailwindcss(),
    pugPlugin(
      {},
      {
        ui: UI,
        categories,
        flairItems,
        languageOptions,
        flairHelpers: {
          getCategory,
          svgUrl,
          jpgUrl
        }
      }
    )
  ],
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
