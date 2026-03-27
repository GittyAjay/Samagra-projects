import { defineEventHandler, redirect } from "h3";

function getWebsiteUrl() {
  return process.env.WEBSITE_URL || "http://localhost:3001";
}

export default defineEventHandler((event) => {
  return redirect(event, getWebsiteUrl(), 302);
});
