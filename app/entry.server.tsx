import { PassThrough } from "node:stream";
import type { EntryContext } from "@remix-run/node";
import { renderToString } from "react-dom/server";
import { RemixServer } from "@remix-run/react";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const body = await renderToString(
    <RemixServer url={request.url} context={remixContext} />
  );

  return new Response(`<!DOCTYPE html>${body}`, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      "content-type": "text/html",
    },
  });
}
