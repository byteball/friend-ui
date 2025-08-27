
export const HowItWorksBlock = () => {
  return <div>
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

        <div className="flex gap-4 items-center">
          <div className="shrink-0 rounded-full w-8 h-8 bg-gray-300/30 flex items-center justify-center font-semibold text-muted-foreground">3</div>
          <div>
            Claim rewards for becoming friends. Each of you gets 1% added to your locked balance, plus 0.1% in liquid FRD (Friend) tokens, which you can spend immediately. Additionally, you get a 10 FRD new user reward and a 10 FRD referral reward (1 FRD ≈ $2).
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl p-4 flex items-center">
        <img src="/handshake.svg" width="100%" alt="Handshake" />
      </div>

    </div>
  </div>
}