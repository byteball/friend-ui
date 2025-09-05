"use client";

import { FC, useCallback, useRef } from "react";

import { appConfig } from "@/appConfig";
import { BOUNCE_FEES, WALLET_COOKIE_NAME } from "@/constants";
import { generateLink } from "@/lib/generateLink";

import { useData } from "@/app/context";
import { getCookie } from "cookies-next/client";
import { Input } from "../ui/input";
import { QRButton } from "../ui/qr-button";

interface DepositFormProps {
  tokens: (TokenMeta | undefined)[];
}

export const ClaimForm: FC<DepositFormProps> = ({ tokens }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const walletAddress = getCookie(WALLET_COOKIE_NAME);
  const data = useData();

  const state = data?.state ?? {};
  const frdAsset = state?.constants?.asset;

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      btnRef.current?.click();
    }
  }, [btnRef]);

  const url = generateLink({
    aa: appConfig.AA_ADDRESS,
    amount: BOUNCE_FEES,
    from_address: walletAddress,
    data: {
      deposit: 1,
    }
  })

  return <div className="grid gap-4">
    <h2 className="text-3xl font-bold">Claim reward</h2>

    <div className="grid gap-4 text-muted-foreground">
      <div>You and your new friend must claim rewards here within 10 minutes of each other. If any of you is late, you have to claim again.</div>
    </div>

    <div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-end max-w-2xl">
          <div className="w-full">
            <label htmlFor="address" className="text-muted-foreground pb-1">Your friend’s address</label>
            <Input id="address" onKeyDown={handleKeyDown} />
          </div>

          <QRButton href={url}>Claim</QRButton>
        </div>
      </div>
    </div>
  </div>
}