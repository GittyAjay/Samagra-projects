import { defineEventHandler, getQuery } from "h3";

import type { Product } from "../../../server/types/domain";
import { listCollection } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const products = await listCollection<Product>("products");

  return products.filter((product) => {
    const matchesCategory = query.category
      ? product.category === String(query.category)
      : true;
    const matchesSearch = query.search
      ? `${product.name} ${product.description}`
          .toLowerCase()
          .includes(String(query.search).toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });
});
