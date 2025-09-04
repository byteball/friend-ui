"use client";

import { useReactiveGetCookie } from "cookies-next";
import { FC } from "react";

import { WALLET_COOKIE_NAME } from "@/actions/constants";
import { useData } from "@/app/context";
import { DepositForm } from "@/components/forms/deposit-form";
import { toLocalString } from "@/lib/toLocalString";


interface DepositProps {
  tokens: (TokenMeta | undefined)[];
}

export const Deposit: FC<DepositProps> = ({ tokens }) => {
  const data = useData();
  const getCookie = useReactiveGetCookie();
  const wallet = getCookie(WALLET_COOKIE_NAME);
  const userData = data?.state[`user_${wallet}`] as IUserData | undefined;
  const symbols = data?.symbols
  const frdAsset = data?.state?.constants?.asset;

  const balances = Object.entries(userData?.balances ?? {}).map(([asset, amount]) => {
    const tokenMeta = symbols ? symbols[asset === 'frd' ? frdAsset : asset] : undefined;

    return { asset, amount, tokenMeta };
  });

  return <>
    <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto mt-16">

      <div className="col-span-2 rounded-lg bg-gray-50">
        <div className="px-4 py-5 sm:p-6 w-full">
          <DepositForm tokens={tokens ?? []} />
        </div>
      </div>

      <div className="col-span-1">

        <div className="rounded-lg px-4 py-5 sm:p-6">
          <h2 className="text-3xl font-bold mb-4">Deposit</h2>

          <div className="flex flex-col gap-4">
            {wallet ? <div className="grid gap-2">
              <div className="text-md">
                <span className="text-muted-foreground">Balances:</span>
                <div>
                  {balances.length > 0 ? (
                    balances.map((balance, index) => (
                      <div key={index}>
                        {toLocalString(balance.amount / 10 ** (balance.tokenMeta?.decimals ?? 0))} <small>{balance.tokenMeta?.symbol}</small>
                      </div>
                    ))
                  ) : (
                    <div>No balances available</div>
                  )}
                </div>
              </div>
              {userData?.unlock_date ? <div>
                <span className="text-muted-foreground">Unlock date:</span> {userData?.unlock_date}
              </div> : null}
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