import { ghostList } from "@/ghost-list";

export interface IGhost {
  name: string;
  image: string;
}

export const getGhostsFromVars = (state: IAaState): IGhost[] => Object.entries(state).map(([key, value]) => {
  if (key.startsWith("user_") && value?.ghost) {
    const name = key.replaceAll("user_", "") as keyof typeof ghostList | undefined;

    return {
      ...value,
      name,
      image: name && name in ghostList ? ghostList[name].image : "/ghosts/default.png"
    }
  } else {
    return null
  }
})
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name, "en"));