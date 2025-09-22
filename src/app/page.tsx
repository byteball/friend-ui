import { Claim } from "@/components/layouts/claim";
import { Deposit } from "@/components/layouts/deposit";
import { HeroBlock } from "@/components/layouts/hero-block";
import { HowItWorksBlock } from "@/components/layouts/how-it-works";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function Home() {

  return <div className="grid space-y-8">
    <HeroBlock />
    <HowItWorksBlock />

    <Tabs defaultValue="deposit" className="items-center">
      <TabsList className="gap-1 bg-transparent">
        <TabsTrigger
          value="deposit"
          className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Deposit
        </TabsTrigger>
        <TabsTrigger
          value="claim"
          className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Claim
        </TabsTrigger>
      </TabsList>
      <TabsContent value="deposit">
        <Deposit />
      </TabsContent>
      <TabsContent value="claim">
        <Claim />
      </TabsContent>
    </Tabs>

  </div>
}
