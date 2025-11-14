export const getContactUrlByUsername = (username?: string, resource?: string, userId?: string): string => {
  if (!username) return "";

  if (resource === "discord" && userId) {
    return `https://discord.com/users/${userId}`;
  } else if (resource === "telegram") {
    return `https://t.me/${username}`;
  }

  return "";
};

