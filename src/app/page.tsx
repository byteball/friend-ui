import { HeroBlock } from "@/components/layouts/hero-block";
import { HowItWorksBlock } from "@/components/layouts/how-it-works";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ClaimWidget } from "@/features/claim";
import { DepositWidget } from "@/features/deposit";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: "Obyte friends — make 1% a day by making friends every day",
  description: "Make 1% a day by making friends every day and spreading the word about Obyte’s unstoppable, censorship-resistant tech",
  openGraph: {
    images: [
      `/api/og/common/main`,
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ObyteOrg',
  },
  robots: {
    index: true,
    follow: true,
  },
}


export default function Home() {

  return <div className="grid space-y-8">
    <HeroBlock />
    <HowItWorksBlock />

    <Tabs defaultValue="deposit" className="items-center">
      <TabsList className="gap-1 bg-transparent">
        <TabsTrigger
          value="deposit"
          className="cursor-pointer text-md data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Deposit
        </TabsTrigger>
        <TabsTrigger
          value="claim"
          className="cursor-pointer text-md data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Claim
        </TabsTrigger>
      </TabsList>
      <TabsContent value="deposit">
        <DepositWidget />
      </TabsContent>
      <TabsContent value="claim">
        <ClaimWidget />
      </TabsContent>
    </Tabs>

  </div>
}
