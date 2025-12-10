"use client";

import { ClaimWidget } from "@/features/claim";
import { DepositWidget } from "@/features/deposit";
import { useQueryState } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export const MainActionTabs = () => {
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: 'deposit',
    clearOnDefault: true,
    parse: (value: string) => (value === 'deposit' || value === 'befriend' ? value : 'deposit'),
  });

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