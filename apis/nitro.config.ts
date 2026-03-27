import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  srcDir: ".",
  serverDir: "server",
  compatibilityDate: "2026-03-23",
  routeRules: {
    "/api/**": { cors: true },
    "/api/dashboard/**": { cache: { maxAge: 60 } },
    "/api/reports/**": { cache: { maxAge: 120 } }
  }
});
