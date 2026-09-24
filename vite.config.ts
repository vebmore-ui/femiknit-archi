import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

function copyPublicAssets() {
  function copyDir(srcDir, destDir) {
    if (!existsSync(srcDir)) return;
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
    for (const entry of readdirSync(srcDir)) {
      const src = join(srcDir, entry);
      const dest = join(destDir, entry);
      if (statSync(src).isFile()) {
        copyFileSync(src, dest);
      } else if (statSync(src).isDirectory()) {
        copyDir(src, dest);
      }
    }
  }

  return {
    name: "copy-public-assets",
    closeBundle() {
      const publicDir = join(process.cwd(), "public");
      const outDir = join(process.cwd(), "build", "client");
      copyDir(publicDir, outDir);
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
