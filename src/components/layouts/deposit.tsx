"use client";

import { useReactiveGetCookie } from "cookies-next";
import { FC } from "react";

import { WALLET_COOKIE_NAME } from "@/actions/constants";
import { useData } from "@/app/context";
import { DepositForm } from "@/components/forms/deposit-form";


interface DepositProps {
  tokens: (TokenMeta | undefined)[];
}

export const Deposit: FC<DepositProps> = ({ tokens }) => {
  const data = useData();
  const getCookie = useReactiveGetCookie();
  const wallet = getCookie(WALLET_COOKIE_NAME);

  const userData = data?.state[`user_${wallet}`] ?? { balances: {} }

  return <>
    <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto mt-16">

      <div className="col-span-2 rounded-lg bg-gray-50">
        <div className="px-4 py-5 sm:p-6 w-full">
          total_locked_bytes:  {JSON.stringify(data?.state?.total_locked_bytes)}
          <DepositForm tokens={tokens ?? []} />
        </div>
      </div>

      <div className="col-span-1">

        <div className="rounded-lg px-4 py-5 sm:p-6">
          <h2 className="text-3xl font-bold mb-4">Deposit</h2>

          <div className="flex flex-col gap-4">
            {wallet ? <div>
              <p className="text-md text-muted-foreground">
                balances: {JSON.stringify(userData.balances)}
              </p>
            </div> : <div>
              <p className="text-md text-muted-foreground">
                Please add your wallet address
              </p>
            </div>}
          </div>

        </div>
      </div>
    </div>

  </>
}