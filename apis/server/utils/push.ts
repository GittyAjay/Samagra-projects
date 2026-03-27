import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

import type { PushToken } from "../types/domain";
import { removeItem } from "./storage";

function getServiceAccountPath() {
  return resolve(
    process.cwd(),
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "samagra-e3afa-firebase-adminsdk-fbsvc-896b5c5889.json"
  );
}

export function isPushConfigured() {
  return existsSync(getServiceAccountPath());
}

function ensureFirebaseApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  const path = getServiceAccountPath();
  if (!existsSync(path)) {
    throw new Error(`Firebase service account file not found at ${path}`);
  }

  const serviceAccount = JSON.parse(readFileSync(path, "utf-8"));

  return initializeApp({
    credential: cert(serviceAccount)
  });
}

export async function sendPushNotificationToTokens({
  tokens,
  title,
  body
}: {
  tokens: PushToken[];
  title: string;
  body: string;
}) {
  if (!tokens.length || !isPushConfigured()) {
    return;
  }

  ensureFirebaseApp();

  const response = await getMessaging().sendEachForMulticast({
    tokens: tokens.map((entry) => entry.token),
    notification: {
      title,
      body
    }
  });

  await Promise.all(
    response.responses.map(async (result, index) => {
      if (result.success) {
        return;
      }

      const code = result.error?.code || "";
      if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
        await removeItem("pushTokens", tokens[index].id);
      }
    })
  );
}
