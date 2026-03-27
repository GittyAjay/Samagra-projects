import { createError, defineEventHandler, getRouterParam } from "h3";

import type { Product } from "../../../server/types/domain";
import { getItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const product = id ? await getItem<Product>("products", id) : null;

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  }

  return product;
});
