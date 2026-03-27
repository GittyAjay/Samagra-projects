import type { OrderStatus } from "../types/domain";

/** Chronological journey: survey + quotation complete before an order row exists; then fulfillment. */
export const ORDER_PIPELINE: OrderStatus[] = [
  "survey_completed",
  "quotation_approved",
  "order_received",
  "equipment_procured",
  "installation_scheduled",
  "installation_in_progress",
  "installation_completed"
];
