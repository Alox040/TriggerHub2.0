import type { IdentityRecord, IdentityStore } from "./identityService";

const OWNER_USER_ID = "owner";
const OWNER_EMAIL = "owner@example.com";

export const createLocalUserStore = (): IdentityStore => {
  const records: IdentityRecord[] = [
    {
      id: OWNER_USER_ID,
      email: OWNER_EMAIL,
      role: "owner",
      createdAt: Date.now(),
    },
  ];

  return {
    readAll: () => records,
  };
};

