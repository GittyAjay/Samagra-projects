import { defineEventHandler, getHeader, getMethod, setHeader } from "h3";

export default defineEventHandler((event) => {
  const origin = getHeader(event, "origin");

  if (origin) {
    setHeader(event, "access-control-allow-origin", origin);
    setHeader(event, "vary", "origin");
  } else {
    setHeader(event, "access-control-allow-origin", "*");
  }

  setHeader(event, "access-control-allow-methods", "GET,POST,PATCH,DELETE,OPTIONS");
  setHeader(event, "access-control-allow-headers", "Content-Type,x-user-id,x-user-role,Authorization");

  if (getMethod(event) === "OPTIONS") {
    event.node.res.statusCode = 204;
    event.node.res.end();
  }
});
