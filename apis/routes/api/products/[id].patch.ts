import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import type { Product } from "../../../server/types/domain";
import { ensureRole } from "../../../server/utils/http";
import { getItem, nowIso, setItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const id = getRouterParam(event, "id");
  const body = await readBody<Partial<Product>>(event);
  const existing = id ? await getItem<Product>("products", id) : null;

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  }

  const updated: Product = {
    ...existing,
    ...body,
    id: existing.id,
    updatedAt: nowIso()
  };

  await setItem("products", updated);
  return updated;
});
