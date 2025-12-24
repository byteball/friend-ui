import Image from "next/image";
import Link from "next/link";
import "server-only";

import { toLocalString } from "@/lib/to-local-string";

import { PuzzleImage } from "../ui/puzzle-image";

import { appConfig } from "@/app-config";

export const HowItWorksBlock = () => {
  const frd = __GLOBAL_STORE__?.getOwnToken();
  const frdToUsd = __GLOBAL_STORE__?.getFrdPriceUSD()?.toFixed(2) ?? 'N/A';

  return (<div>
    <div className="grid max-w-6xl grid-cols-3 gap-8 mx-auto">
      <div className="col-span-3 p-4 space-y-8 text-center md:col-span-2 md:text-left">

        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="flex items-center justify-center w-10 h-10 text-lg font-semibold border rounded-full bg-primary/10 border-primary/30 text-primary md:text-xl shrink-0">1</div>
          <div className="text-lg text-gray-200">Deposit and lock funds for at least 1 year below.</div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="flex items-center justify-center w-10 h-10 text-lg font-semibold border rounded-full bg-primary/10 border-primary/30 text-primary md:text-xl shrink-0">2</div>
          <div className="text-lg text-gray-200">Find a friend who does the same.</div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
          <div className="flex items-center justify-center w-10 h-10 text-lg font-semibold border rounded-full bg-primary/10 border-primary/30 text-primary md:text-xl shrink-0">3</div>
          <div className="text-lg leading-relaxed text-gray-200">
            Claim rewards for becoming friends. Each of you gets {toLocalString(appConfig.initialRewardsVariables.locked_reward_share * 100)}% added to your locked balance, plus {toLocalString(appConfig.initialRewardsVariables.liquid_reward_share * 100)}% in liquid {frd?.symbol} (Friend) tokens, which you can spend immediately. Additionally, you get a {toLocalString(appConfig.initialRewardsVariables.new_user_reward / 10 ** (frd?.decimals ?? 0))} {frd?.symbol} new user reward and a {toLocalString(appConfig.initialRewardsVariables.referral_reward / 10 ** (frd?.decimals ?? 0))} {frd?.symbol} referral reward (1 {frd?.symbol} &asymp; ${frdToUsd}).
          </div>
        </div>

        <div className="text-lg leading-relaxed text-gray-200">
          The 1% daily rewards compound. If you deposit 1 {frd?.symbol} and make one friend every day for a year, your locked balance will grow to 37.8 {frd?.symbol}, and you’ll receive 3.68 liquid {frd?.symbol} over the course of the year (not including new user and referral rewards).
        </div>
      </div>

      <div className="col-span-3 p-4 shrink-0 md:col-span-1">
        <Image src="/handshake.svg" alt="how it works" width={340} height={300} className="mx-auto md:mx-0" />
      </div>

    </div>

    <div className="grid max-w-5xl grid-cols-3 gap-12 mx-auto mt-24">

      <div className="col-span-3 select-none md:col-span-1">
        <div className="md:w-full">
          <div className="bg-primary/10 border border-primary/30 p-4 flex max-w-[350px] md:w-full mx-auto rounded-xl">
            <PuzzleImage
              src="/ghosts/tim-may.png"
              rows={2}
              columns={2}
              filledCells={1}
              alt="Tim May"
              width={250}
              className="w-full shrink-0"
              height={250}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col col-span-3 space-y-4 text-lg leading-relaxed text-gray-200 md:col-span-2">
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