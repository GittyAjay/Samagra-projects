import { defineEventHandler, readBody } from "h3";

import type { Product } from "../../../server/types/domain";
import { ensureRole, requireFields } from "../../../server/utils/http";
import { createId, nowIso, setItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const body = await readBody<Partial<Product>>(event);
  requireFields(body, ["name", "category", "description", "estimatedPrice"]);

  const timestamp = nowIso();
  const product: Product = {
    id: createId("product"),
    name: body.name as string,
    category: body.category as Product["category"],
    description: body.description as string,
    capacityKw: body.capacityKw,
    estimatedPrice: Number(body.estimatedPrice),
    warrantyYears: body.warrantyYears,
    compatibility: body.compatibility ?? [],
    imageUrls: body.imageUrls ?? [],
    specifications: body.specifications ?? {},
    active: body.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await setItem("products", product);
  return product;
});
