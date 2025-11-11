"use client";

import { FC } from "react";

import { DepositForm } from "./deposit-form";


interface IDepositProps { }

export const DepositWidget: FC<IDepositProps> = () => {
  return <div className="max-w-4xl gap-4 mx-auto mt-4 md:mt-12">
    <div className="rounded-lg bg-gray-50">
      <div className="w-full px-4 py-5 sm:p-6">
        <DepositForm />
      </div>
    </div>
  </div>
}