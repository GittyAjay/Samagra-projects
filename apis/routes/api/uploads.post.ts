import { defineEventHandler, readBody } from "h3";

import { requireFields } from "../../server/utils/http";
import { createId } from "../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ fileName?: string; documentType?: string }>(event);
  requireFields(body, ["fileName", "documentType"]);

  return {
    id: createId("upload"),
    fileName: body.fileName,
    documentType: body.documentType,
    fileUrl: `https://example.com/uploads/${encodeURIComponent(body.fileName as string)}`
  };
});
