import { randomUUID } from "node:crypto";

import { usePrisma } from "./prisma";

const DATE_KEYS = ["createdAt", "updatedAt"];

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

function serializeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        if (DATE_KEYS.includes(key) && typeof entry === "string") {
          return [key, new Date(entry)];
        }

        if (key.endsWith("At") && typeof entry === "string" && !Number.isNaN(Date.parse(entry))) {
          return [key, new Date(entry)];
        }

        return [key, serializeValue(entry)];
      })
    );
  }

  return value;
}

function deserializeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deserializeValue);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, deserializeValue(entry)])
    );
  }

  return value;
}

export async function listCollection<T>(collection: string): Promise<T[]> {
  const prisma = usePrisma();
  const rows = await prisma.appEntity.findMany({
    where: { collection },
    orderBy: { entityId: "asc" }
  });

  return rows.map((row) => deserializeValue(row.data) as T);
}

export async function getItem<T>(collection: string, id: string): Promise<T | null> {
  const prisma = usePrisma();
  const row = await prisma.appEntity.findUnique({
    where: {
      collection_entityId: {
        collection,
        entityId: id
      }
    }
  });

  return row ? (deserializeValue(row.data) as T) : null;
}

export async function setItem<T extends { id: string }>(collection: string, value: T) {
  const prisma = usePrisma();
  const data = serializeValue(value);

  await prisma.appEntity.upsert({
    where: {
      collection_entityId: {
        collection,
        entityId: value.id
      }
    },
    create: {
      collection,
      entityId: value.id,
      data
    },
    update: {
      data
    }
  });

  return value;
}

export async function removeItem(collection: string, id: string) {
  const prisma = usePrisma();

  await prisma.appEntity.deleteMany({
    where: {
      collection,
      entityId: id
    }
  });
}

export async function seedCollection<T extends { id: string }>(collection: string, items: T[]) {
  const prisma = usePrisma();
  const existingRows = await prisma.appEntity.findMany({
    where: { collection },
    select: { entityId: true }
  });

  const existingIds = new Set(existingRows.map((row) => row.entityId));
  const missingItems = items.filter((item) => !existingIds.has(item.id));

  if (!missingItems.length) {
    return;
  }

  await Promise.all(missingItems.map((item) => setItem(collection, item)));
}
