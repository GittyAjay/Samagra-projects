import { createError, defineEventHandler, getRouterParam } from "h3";

import { ensureRole } from "../../../server/utils/http";
import { getItem, removeItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const id = getRouterParam(event, "id");
  const existing = id ? await getItem("products", id) : null;

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  }

  await removeItem("products", id as string);
  return { message: "Product deleted successfully" };
});
