import { appConfig } from "@/app-config";
import { toLocalString } from "@/lib/to-local-string";
import Link from "next/link";
import "server-only";
import { PuzzleImage } from "../ui/puzzle-image";

export const HowItWorksBlock = () => {
  const frd = __GLOBAL_STORE__?.getOwnToken();
  const frdToUsd = __GLOBAL_STORE__?.getFrdPriceUSD()?.toPrecision(2) ?? 'N/A';

  return (<div>
    <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
      <div className="col-span-3 md:col-span-2 p-4">

        <div className="flex gap-4 items-center mb-6">
          <div className="shrink-0 rounded-full w-8 h-8 bg-gray-300/30 flex items-center justify-center font-semibold text-muted-foreground">1</div>
          <div>Deposit and lock funds for at least 1 year below.</div>
        </div>

        <div className="flex gap-4 items-center mb-6">
          <div className="shrink-0 rounded-full w-8 h-8 bg-gray-300/30 flex items-center justify-center font-semibold text-muted-foreground">2</div>
          <div>Find a friend who does the same.</div>
        </div>

        <div className="flex gap-4 items-center mb-6">
          <div className="shrink-0 rounded-full w-8 h-8 bg-gray-300/30 flex items-center justify-center font-semibold text-muted-foreground">3</div>
          <div>
            Claim rewards for becoming friends. Each of you gets {toLocalString(appConfig.initialRewardsVariables.locked_reward_share * 100)}% added to your locked balance, plus {toLocalString(appConfig.initialRewardsVariables.liquid_reward_share * 100)}% in liquid {frd?.symbol} (Friend) tokens, which you can spend immediately. Additionally, you get a {toLocalString(appConfig.initialRewardsVariables.new_user_reward / 10 ** (frd?.decimals ?? 0))} {frd?.symbol} new user reward and a {toLocalString(appConfig.initialRewardsVariables.referral_reward / 10 ** (frd?.decimals ?? 0))} {frd?.symbol} referral reward (1 {frd?.symbol} &asymp; ${frdToUsd}).
          </div>
        </div>
        <div className="text-muted-foreground text-sm">
          The 1% daily rewards compound. If you deposit 1 {frd?.symbol} and make one friend every day for a year, your locked balance will grow to 37.8 {frd?.symbol}, and you’ll receive 3.68 liquid {frd?.symbol} over the course of the year (not including new user and referral rewards).
        </div>
      </div>

      <div className="bg-white hidden rounded-xl p-4 md:flex items-center">
        <img src="/handshake.svg" width="100%" alt="Handshake" />
      </div>

    </div>

    <div className="grid grid-cols-3 items-center gap-8 max-w-5xl mx-auto mt-8">

      <div className="col-span-3 md:col-span-1 select-none">
        <PuzzleImage
          src="/ghosts/tim-may.png"
          rows={2}
          columns={2}
          filledCells={2}
          alt="Tim May"
          width={250}
          height={250}
          className="mx-auto"
        />
      </div>

      <div className="col-span-3 md:col-span-2 space-y-4">
        <p>
          After completing a 4-day streak of making new friends daily, you can become friends with the ghost of a famous cypherpunk, such as Satoshi Nakamoto, Tim May, Hal Finney, and others. After an additional 9 days, you can meet another, and so on.
        </p>

        <p>
          See more details in the <Link className="text-blue-700" href="/faq">FAQ</Link>.
        </p>
      </div>
    </div>
  </div>)
}