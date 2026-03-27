import { defineEventHandler } from "h3";

export default defineEventHandler(() => {
  return {
    name: "Solar Sales Management API",
    status: "ok",
    docs: {
      swagger: "/docs",
      openapi: "/openapi.json",
      health: "/health",
      authLogin: "/api/auth/login",
      products: "/api/products",
      clientDashboard: "/api/dashboard/client/user_client_1",
      adminDashboard: "/api/dashboard/admin"
    },
    note: "Use the API routes above to test the backend."
  };
});
