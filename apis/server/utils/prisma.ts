import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __solarPrisma__: PrismaClient | undefined;
}

export function usePrisma() {
  if (!globalThis.__solarPrisma__) {
    globalThis.__solarPrisma__ = new PrismaClient();
  }

  return globalThis.__solarPrisma__;
}
