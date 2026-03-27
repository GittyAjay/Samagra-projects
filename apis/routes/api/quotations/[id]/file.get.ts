import { createError, defineEventHandler, getRouterParam, setHeader } from "h3";

import type { Quotation } from "../../../../server/types/domain";
import { getItem } from "../../../../server/utils/storage";
import { createSimplePdf } from "../../../../server/utils/pdf";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const quotation = id ? await getItem<Quotation>("quotations", id) : null;

  if (!quotation) {
    throw createError({ statusCode: 404, statusMessage: "Quotation not found" });
  }

  setHeader(event, "content-type", "application/pdf");
  setHeader(event, "content-disposition", `attachment; filename="quotation-${quotation.id}.pdf"`);

  return createSimplePdf({
    title: "Samagra Solar Quotation",
    subtitle: `Quotation ${quotation.id}`,
    sections: [
      {
        heading: "Overview",
        rows: [
          `Lead: ${quotation.leadId}`,
          `Client: ${quotation.clientId}`,
          `Prepared By: ${quotation.staffId}`,
          `Status: ${quotation.status}`,
          `System Size: ${quotation.systemSizeKw} kW`,
        ],
      },
      {
        heading: "Pricing",
        rows: [
          `Subtotal: INR ${quotation.subtotal}`,
          `Subsidy: INR ${quotation.subsidyAmount}`,
          `Final Price: INR ${quotation.finalPrice}`,
          quotation.subsidyScheme ? `Subsidy Scheme: ${quotation.subsidyScheme}` : "Subsidy Scheme: N/A",
        ],
      },
      {
        heading: "Items",
        rows: quotation.items.map(
          (item) =>
            `${item.label} | ${item.quantity} x INR ${item.unitPrice} = INR ${
              Number(item.quantity) * Number(item.unitPrice)
            }`
        ),
      },
      {
        heading: "Notes",
        rows: [quotation.notes || "No additional notes"],
      },
    ],
  });
});
