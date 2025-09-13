"use server";

import { Claim } from "@/components/layouts/claim";
import { Deposit } from "@/components/layouts/deposit";
import { HeroBlock } from "@/components/layouts/hero-block";
import { HowItWorksBlock } from "@/components/layouts/how-it-works";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDepositTokens } from "@/lib/getDepositTokens.server";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const depositTokens = await getDepositTokens();

  return <div className="grid space-y-8">
    <HeroBlock />
    <HowItWorksBlock />


    <Tabs defaultValue="deposit" className="items-center">
      <TabsList className="gap-1 bg-transparent">
        <TabsTrigger
          value="deposit"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
        >
          Deposit
        </TabsTrigger>
        <TabsTrigger
          value="claim"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
        >
          Claim
        </TabsTrigger>
      </TabsList>
      <TabsContent value="deposit">
        <Deposit tokens={depositTokens} />
      </TabsContent>
      <TabsContent value="claim">
        <Claim tokens={depositTokens} />
      </TabsContent>
    </Tabs>

  </div>
}
