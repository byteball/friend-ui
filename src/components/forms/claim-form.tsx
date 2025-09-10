"use client";

import { getCookie } from "cookies-next/client";
import { FC, useCallback, useRef } from "react";

import { DescriptionDetail, DescriptionGroup, DescriptionList, DescriptionTerm } from "../ui/description-list";
import { Input } from "../ui/input";
import { QRButton } from "../ui/qr-button";

import { appConfig } from "@/appConfig";
import { BOUNCE_FEES, WALLET_COOKIE_NAME } from "@/constants";
import { generateLink } from "@/lib/generateLink";

import { useData } from "@/app/context";

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

        <DescriptionList>
          <DescriptionGroup>
            <DescriptionTerm>Locked rewards</DescriptionTerm>
            <DescriptionDetail>
              <div>312312 FRD (1% of your total balance 312312 FRD)</div>
              <div>10 FRD (new user reward)</div>
              <div>10 FRD (referral reward)</div>
            </DescriptionDetail>
          </DescriptionGroup>
          <DescriptionGroup horizontal>
            <DescriptionTerm>Total rewards</DescriptionTerm>
            <DescriptionDetail>3123123.12312 FRD</DescriptionDetail>
          </DescriptionGroup>
          <DescriptionGroup horizontal>
            <DescriptionTerm>Liquid rewards</DescriptionTerm>
            <DescriptionDetail>
              123.123 FRD (0.1% of your total balance 123.123 FRD)
            </DescriptionDetail>
          </DescriptionGroup>
        </DescriptionList>

      </div>
    </div>
  </div>
}