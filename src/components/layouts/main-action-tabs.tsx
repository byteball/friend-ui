"use client";

import { ClaimWidget } from "@/features/claim";
import { DepositWidget } from "@/features/deposit";
import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { scroller } from "react-scroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export const MainActionTabs = () => {
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: 'deposit',
    clearOnDefault: true,
    parse: (value: string) => (value === 'deposit' || value === 'befriend' ? value : 'deposit'),
  });

  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('friend_address') && searchParams.get('tab') === 'befriend') {
      scroller.scrollTo("befriend", {
        duration: 600,
        smooth: true,
        offset: 0
      });
    }
  }, [searchParams]);

  return <Tabs value={tab} onValueChange={setTab} className="items-center">
    <TabsList className="gap-1 bg-transparent">
      <TabsTrigger
        value="deposit"
        className="cursor-pointer text-md data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
      >
        Deposit
      </TabsTrigger>
      <TabsTrigger
        value="befriend"
        name="befriend"
        className="cursor-pointer text-md data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
      >
        New friendship
      </TabsTrigger>
    </TabsList>
    <TabsContent value="deposit">
      <DepositWidget />
    </TabsContent>
    <TabsContent value="befriend">
      <ClaimWidget />
    </TabsContent>
  </Tabs>
}