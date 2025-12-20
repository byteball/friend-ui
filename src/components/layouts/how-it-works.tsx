import { appConfig } from "@/app-config";
import { toLocalString } from "@/lib/to-local-string";
import Link from "next/link";
import "server-only";
import { PuzzleImage } from "../ui/puzzle-image";
import PartnershipWidget from "./partnership-widget";

export const HowItWorksBlock = () => {
  const frd = __GLOBAL_STORE__?.getOwnToken();
  const frdToUsd = __GLOBAL_STORE__?.getFrdPriceUSD()?.toFixed(2) ?? 'N/A';

  return (<div>
    <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="col-span-3 md:col-span-2 p-4 space-y-8 text-center md:text-left">

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-10 h-10 flex justify-center items-center bg-primary/10 border border-primary/30 rounded-full text-primary font-semibold text-lg md:text-xl shrink-0">1</div>
          <div className="text-xl text-gray-200">Deposit and lock funds for at least 1 year below.</div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-10 h-10 flex justify-center items-center bg-primary/10 border border-primary/30 rounded-full text-primary font-semibold text-lg md:text-xl shrink-0">2</div>
          <div className="text-xl text-gray-200">Find a friend who does the same.</div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <div className="w-10 h-10 flex justify-center items-center bg-primary/10 border border-primary/30 rounded-full text-primary font-semibold text-lg md:text-xl shrink-0">3</div>
          <div className="text-xl leading-relaxed text-gray-200">
            Claim rewards for becoming friends. Each of you gets {toLocalString(appConfig.initialRewardsVariables.locked_reward_share * 100)}% added to your locked balance, plus {toLocalString(appConfig.initialRewardsVariables.liquid_reward_share * 100)}% in liquid {frd?.symbol} (Friend) tokens, which you can spend immediately. Additionally, you get a {toLocalString(appConfig.initialRewardsVariables.new_user_reward / 10 ** (frd?.decimals ?? 0))} {frd?.symbol} new user reward and a {toLocalString(appConfig.initialRewardsVariables.referral_reward / 10 ** (frd?.decimals ?? 0))} {frd?.symbol} referral reward (1 {frd?.symbol} &asymp; ${frdToUsd}).
          </div>
        </div>

        <div className="text-gray-200 leading-relaxed text-md">
          The 1% daily rewards compound. If you deposit 1 {frd?.symbol} and make one friend every day for a year, your locked balance will grow to 37.8 {frd?.symbol}, and you’ll receive 3.68 liquid {frd?.symbol} over the course of the year (not including new user and referral rewards).
        </div>
      </div>

      <div className="shrink-0 col-span-3 md:col-span-1 md:flex items-center">
        <PartnershipWidget />
      </div>

    </div>

    <div className="grid grid-cols-3 items-center gap-12 max-w-5xl mx-auto mt-16">

      <div className="col-span-3 md:col-span-1 select-none">
        <div className="md:w-full">
          <div className="bg-primary/10 border border-primary/30 p-4 flex max-w-[350px] md:w-full mx-auto rounded-xl">
            <PuzzleImage
              src="/ghosts/tim-may.png"
              rows={2}
              columns={2}
              filledCells={2}
              alt="Tim May"
              width={250}
              className="w-full shrink-0"
              height={250}
            />
          </div>
        </div>
      </div>

      <div className="col-span-3 text-gray-200 h-full py-8 flex flex-col justify-between leading-relaxed text-xl md:col-span-2 space-y-4">
        <p>
          After completing a 4-day streak of making new friends daily, you can become friends with the ghost of a famous cypherpunk, such as Satoshi Nakamoto, Tim May, Hal Finney, and others. After an additional 9 days, you can meet another, and so on.
        </p>

        <p>
          See more details in the <Link href="/faq">FAQ</Link>.
        </p>
      </div>
    </div>
  </div>)
}