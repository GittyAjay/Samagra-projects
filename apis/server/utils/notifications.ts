import type { Notification, PushToken, UserProfile } from "../types/domain";
import { createId, getItem, listCollection, nowIso, setItem } from "./storage";
import { isMailConfigured, sendEmail } from "./mail";
import { isPushConfigured, sendPushNotificationToTokens } from "./push";

type NotifyUserInput = {
  userId: string;
  title: string;
  message: string;
  type: Notification["type"];
  emailSubject?: string;
  emailText?: string;
  emailHtml?: string;
  sendEmailCopy?: boolean;
};

export async function createNotification(input: NotifyUserInput) {
  const notification: Notification = {
    id: createId("notif"),
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
    read: false,
    createdAt: nowIso()
  };

  await setItem("notifications", notification);
  return notification;
}

export async function notifyUser(input: NotifyUserInput) {
  const notification = await createNotification(input);
  const [user, pushTokens] = await Promise.all([
    getItem<UserProfile>("users", input.userId),
    listCollection<PushToken>("pushTokens")
  ]);

  const userPushTokens = pushTokens.filter((token) => token.userId === input.userId && token.active);
  if (userPushTokens.length && isPushConfigured()) {
    try {
      await sendPushNotificationToTokens({
        tokens: userPushTokens,
        title: input.title,
        body: input.message
      });
    } catch (error) {
      console.error("Failed to send push notification", {
        userId: input.userId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (input.sendEmailCopy === false || !isMailConfigured() || !user?.email) {
    return notification;
  }

  try {
    await sendEmail({
      to: user.email,
      subject: input.emailSubject || input.title,
      text: input.emailText || input.message,
      html:
        input.emailHtml ||
        `<div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;"><p>${input.message}</p></div>`
    });
  } catch (error) {
    console.error("Failed to send email notification", {
      userId: input.userId,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return notification;
}
