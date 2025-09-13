"use client";

import { FC } from "react";

import { ClaimForm } from "@/components/forms/claim-form";


interface ClaimProps {
  tokens: (TokenMeta | undefined)[];
}

export const Claim: FC<ClaimProps> = ({ tokens }) => {
  return <div className="gap-4 max-w-4xl mx-auto mt-16">
    <div className="rounded-lg bg-gray-50">
      <div className="px-4 py-5 sm:p-6 w-full">
        <ClaimForm />
      </div>
    </div>
  </div>
}