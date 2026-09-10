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

import { entry, routes, assets, assetsBuildDirectory, future, mode, publicPath } from "./build/index.js";

const handler = createRequestHandler(() => ({
  entry: { module: entry.module },
  routes,
  assets,
  assetsBuildDirectory,
  future,
  mode,
  publicPath,
}));

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
  if (error && typeof error === "object") {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return { message: String(error) };
    }
  }
  return { message: String(error) };
}

function logError(error: unknown, request: Request) {
  const errorInfo = serializeError(error);
  const url = new URL(request.url);
  console.error(JSON.stringify({
    level: "error",
    message: errorInfo.message,
    error: errorInfo,
    request: {
      method: request.method,
      url: request.url,
      path: url.pathname,
      headers: Object.fromEntries(request.headers.entries()),
    },
    timestamp: new Date().toISOString(),
  }));
}

function handleFavicon(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.pathname === "/favicon.ico") {
    const svgUrl = new URL("/favicon.svg", request.url);
    return Response.redirect(svgUrl.toString(), 302);
  }
  return null;
}

export default {
  fetch: async (request, env, ctx) => {
    workerEnv = env;
    try {
      const faviconResponse = handleFavicon(request);
      if (faviconResponse) return faviconResponse;
      return await handler(request, { cloudflare: { env } });
    } catch (error) {
      logError(error, request);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
