"use client";

import { FC } from "react";

import { DepositForm } from "@/components/forms/deposit-form";


interface DepositProps {
  tokens: (TokenMeta | undefined)[];
}

export const Deposit: FC<DepositProps> = ({ tokens }) => {
  return <div className="gap-4 max-w-4xl mx-auto mt-16">
    <div className="rounded-lg bg-gray-50">
      <div className="px-4 py-5 sm:p-6 w-full">
        <DepositForm tokens={tokens ?? []} />
      </div>
    </div>
  </div>
}