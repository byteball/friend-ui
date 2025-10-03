export const getNameByKey = (key: keyof AgentParams) => {
  return key
    .slice(0, 1)
    .toUpperCase()

    + key.slice(1)
      .split("_")
      .join(" ")
      .replaceAll("aa", "AA");
}