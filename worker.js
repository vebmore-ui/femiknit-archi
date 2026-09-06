import { createRequestHandler } from "@remix-run/cloudflare";

let workerEnv = {};

if (typeof process !== "undefined" && process.env) {
  const originalEnv = process.env;
  process.env = new Proxy(originalEnv, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return workerEnv[prop];
    },
    has(target, prop) {
      return prop in target || prop in workerEnv;
    },
    });
}

import { entry, routes, assets as serverManifest, assetsBuildDirectory, basename, future, isSpaMode, mode, publicPath } from "./build/server/index.js";

const handler = createRequestHandler(() => ({
  entry: { module: entry.module },
  routes,
  assets: serverManifest,
  assetsBuildDirectory,
  basename,
  future,
  isSpaMode,
  mode,
  publicPath,
}));

export default {
  fetch: (request, env, ctx) => {
    workerEnv = env;
    return handler(request);
  },
};
