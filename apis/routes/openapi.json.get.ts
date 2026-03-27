import { defineEventHandler, getRequestURL } from "h3";

import { getOpenApiDocument } from "../server/utils/openapi";

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const baseUrl = `${url.protocol}//${url.host}`;

  return getOpenApiDocument(baseUrl);
});
