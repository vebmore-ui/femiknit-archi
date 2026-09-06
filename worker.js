import { createRequestHandler } from "@remix-run/cloudflare";

let workerEnv = {};

const ensureProcessEnv = () => {
  if (typeof globalThis.process === "undefined") {
    // @ts-ignore
    globalThis.process = {};
  }
  if (!globalThis.process.env) {
    // @ts-ignore
    globalThis.process.env = {};
  }
};

ensureProcessEnv();

const envTarget = globalThis.process.env;
globalThis.process.env = new Proxy(envTarget, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return workerEnv[prop];
  },
  has(target, prop) {
    return prop in target || prop in workerEnv;
  },
});

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
