import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

function copyPublicAssets() {
  return {
    name: "copy-public-assets",
    closeBundle() {
      const publicDir = join(process.cwd(), "public");
      const outDir = join(process.cwd(), "build", "client");
      if (!existsSync(publicDir)) return;
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      for (const file of readdirSync(publicDir)) {
        const src = join(publicDir, file);
        const dest = join(outDir, file);
        if (statSync(src).isFile()) {
          copyFileSync(src, dest);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    copyPublicAssets(),
  ],
});
