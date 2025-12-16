import { appConfig } from "@/app-config";
import { Highlighter } from "@/components/magicui/highlighter";
import { toLocalString } from "@/lib/to-local-string";

export const HeroBlock = () => (
  <div className="w-full overflow-hidden">
    <div className="px-6 pb-18 pt-4 sm:pb-18 lg:flex lg:justify-center lg:px-8 lg:pb-18">
      <div>

        <h1 className="text-center w-full text-pretty text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
          Obyte Friends
        </h1>

        <p className="text-center mt-8 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
          <Highlighter action="underline" color="#FF9800">Make {toLocalString(appConfig.initialRewardsVariables.locked_reward_share * 100)}% a day</Highlighter> by making <Highlighter action="underline" color="#87CEFA">friends</Highlighter> every day
        </p>

        <p className="text-center mt-2 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">and spreading the word about <a href="https://obyte.org" className="font-bold" target="_blank">Obyte</a>'s unstoppable, censorship-resistant tech</p>
      </div>
    </div>

  </div>
);