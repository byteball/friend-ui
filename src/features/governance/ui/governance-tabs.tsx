"use client";

import { parseAsStringEnum, useQueryState } from 'nuqs';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GovernanceParamList } from "@/features/governance";

// Enums (string-based only)
enum Tab {
  params = 'PARAMS',
  deposit_assets = 'DEPOSIT_ASSETS'
}

export const GovernanceTabs = () => {
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum<Tab>(Object.values(Tab)) // pass a list of allowed values
      .withDefault(Tab.params)
  );

  return (<Tabs
    defaultValue={tab}
    onValueChange={(value) => setTab(value as Tab)}
    activationMode="automatic"
    className="mt-10"
  >
    <TabsList>
      <TabsTrigger value={Tab.params}>Parameters</TabsTrigger>
      <TabsTrigger value={Tab.deposit_assets}>Deposit assets</TabsTrigger>
    </TabsList>

    <TabsContent value={Tab.params} className="max-w-4xl mt-4">
      <GovernanceParamList />
    </TabsContent>

    <TabsContent value={Tab.deposit_assets} className="max-w-4xl mt-4">
      Deposit assets coming soon...
    </TabsContent>
  </Tabs>)
}