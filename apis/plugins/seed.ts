import { defineNitroPlugin } from "nitro/runtime";

import type { UserProfile } from "../server/types/domain";
import { seedCollection } from "../server/utils/storage";

export default defineNitroPlugin(async () => {
  const timestamp = new Date().toISOString();

  const users: UserProfile[] = [
    {
      id: "user_admin_1",
      role: "admin",
      fullName: "Solar Admin",
      email: "admin@solar.local",
      phone: "9999999999",
      password: "Admin@123",
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  await seedCollection("users", users);
});
