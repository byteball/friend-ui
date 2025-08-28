import Link from "next/link"

export const HowItWorksBlock = () => (<div>
  <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
    <div className="col-span-2 p-4">

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
          Claim rewards for becoming friends. Each of you gets 1% added to your locked balance, plus 0.1% in liquid FRD (Friend) tokens, which you can spend immediately. Additionally, you get a 10 FRD new user reward and a 10 FRD referral reward (1 FRD ≈ $2).
        </div>
      </div>
      <div>
        The 1% daily rewards compound. If you deposit 1 FRD and make one friend every day for a year, your locked balance will grow to 37.8 FRD, and you’ll receive 3.68 liquid FRD over the course of the year (not including new user and referral rewards).
      </div>
    </div>

    <div className="bg-white rounded-xl p-4 flex items-center">
      <img src="/handshake.svg" width="100%" alt="Handshake" />
    </div>

  </div>

  <div className="grid grid-cols-3 items-center gap-8 max-w-5xl mx-auto mt-8">

    <div className="col-span-1">
      <img src="/tim-may.png" alt="Tim May" className="w-[250px] h-[250px] mx-auto rounded-xl" />
    </div>

    <div className="col-span-2 space-y-4">
      <p>
        After completing a 4-day streak of making new friends daily, you can become friends with the ghost of a famous cypherpunk, such as Satoshi Nakamoto, Tim May, Hal Finney, and others. After an additional 9 days, you can meet another, and so on.
      </p>

      <p>
        See more details in the <Link className="text-blue-700" href="/faq">FAQ</Link>.
      </p>
    </div>
  </div>
</div>)