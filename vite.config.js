import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import pugPlugin from "vite-plugin-pug";

export default defineConfig({
  plugins: [
    tailwindcss(),
    pugPlugin({}, {})
  ],
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
