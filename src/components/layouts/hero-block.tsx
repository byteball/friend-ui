import { appConfig } from "@/app-config";
import { toLocalString } from "@/lib/to-local-string";

export const HeroBlock = () => (
  <div className="w-full overflow-hidden">
    <div className="px-6 pb-18 pt-4 sm:pb-18 lg:flex lg:justify-center lg:px-8 lg:pb-18">
      <div>

        <h1 className="text-center w-full text-pretty text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
          Obyte Friends
        </h1>

        <p className="text-gray-200 mx-auto mb-8 mt-6 text-balance leading-relaxed text-xl text-center max-w-3xl">
          Make {toLocalString(appConfig.initialRewardsVariables.locked_reward_share * 100)}% a day by making friends every day and spreading the word about <a href="https://obyte.org" className="font-semibold underline-offset-3 underline" target="_blank">Obyte</a>'s unstoppable, censorship-resistant tech
        </p>
      </div>
    </div>

  </div>
);