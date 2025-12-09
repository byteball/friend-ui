export const getNameByKey = (key: keyof AgentParams) => {
  let newKey = key
    .slice(0, 1)
    .toUpperCase()

    + key.slice(1)
      .split("_")
      .join(" ")
      .replaceAll("aa", "AA");


  if (newKey.endsWith("deposit reward share")) {
    if (newKey.includes("bytes")) {
      newKey = "Referrer deposit reward share for GBYTE";
    } else if (newKey.includes("frd")) {
      newKey = "Referrer deposit reward share for FRD";
    } else if (newKey.includes("deposit asset")) {
      newKey = "Referrer deposit reward share for external deposit assets";
    }
  }

  return newKey;
}