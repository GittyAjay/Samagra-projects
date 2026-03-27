import { defineEventHandler, getQuery } from "h3";

import type { UserProfile, UserRole } from "../../../server/types/domain";
import { ensureRole } from "../../../server/utils/http";
import { listCollection } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);

  const query = getQuery(event);
  const role = query.role ? String(query.role) as UserRole : undefined;
  const search = query.search ? String(query.search).toLowerCase() : "";
  const users = await listCollection<UserProfile>("users");

  return users.filter((user) => {
    const matchesRole = role ? user.role === role : true;
    const matchesSearch = search
      ? `${user.fullName} ${user.email} ${user.phone}`.toLowerCase().includes(search)
      : true;

    return matchesRole && matchesSearch;
  });
});
