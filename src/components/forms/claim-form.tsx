"use client";

import { isValidAddress as validateObyteAddress } from "@/lib/isValidAddress";
import { getCookie } from "cookies-next/client";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { DescriptionDetail, DescriptionGroup, DescriptionList, DescriptionTerm } from "../ui/description-list";
import { Input } from "../ui/input";
import { QRButton } from "../ui/qr-button";

import { appConfig } from "@/appConfig";
import { BOUNCE_FEES, WALLET_COOKIE_NAME } from "@/constants";
import { generateLink } from "@/lib/generateLink";

import { useData } from "@/app/context";
import { toLocalString } from "@/lib/toLocalString";

interface ClaimFormProps { }

export const ClaimForm: FC<ClaimFormProps> = () => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const walletAddress = getCookie(WALLET_COOKIE_NAME);
  const data = useData();
  const [inputFriendWallet, setInputFriendWallet] = useState({ value: '', isValid: false });

  const state = data?.state ?? {};
  const frdAsset = state?.constants?.asset;
  const frdTokenMeta = data?.symbols?.[frdAsset || ''];
  const frdSmb = frdTokenMeta?.symbol || 'FRD';

  useEffect(() => {
    let cancelled = false;
    const v = inputFriendWallet.value.trim();
    if (!v) {
      setInputFriendWallet((prev) => ({ ...prev, isValid: false }));
      return;
    }
    (async () => {
      const ok = await validateObyteAddress(v);
      if (!cancelled) setInputFriendWallet((prev) => ({ ...prev, isValid: ok }));
    })();
    return () => {
      cancelled = true;
    };
  }, [inputFriendWallet.value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" && inputFriendWallet.isValid) {
      btnRef.current?.click();
    }
  }, [btnRef, inputFriendWallet.isValid]);

  const url = generateLink({
    aa: appConfig.AA_ADDRESS,
    amount: BOUNCE_FEES,
    from_address: walletAddress,
    data: {
      connect: 1,
      friend: inputFriendWallet.value.trim()
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
            <Input
              id="address"
              value={inputFriendWallet.value}
              onChange={(e) => setInputFriendWallet((prev) => ({ ...prev, value: e.target.value || "" }))}
              onKeyDown={handleKeyDown}
            />
          </div>

          <QRButton href={url} disabled={!inputFriendWallet.isValid} ref={btnRef}>Claim</QRButton>
        </div>
        <DescriptionList>
          <DescriptionGroup>
            <DescriptionTerm>Locked rewards</DescriptionTerm>
            <DescriptionDetail>
              <div>{toLocalString(1231.312)} <small>{frdSmb}</small> (1% of your total balance {toLocalString(1231.312)} <small>{frdSmb}</small>)</div>
              <div>{toLocalString(10)} <small>{frdSmb}</small> (new user reward)</div>
              <div>{toLocalString(10)} <small>{frdSmb}</small> (referral reward)</div>
            </DescriptionDetail>
          </DescriptionGroup>
          <DescriptionGroup horizontal>
            <DescriptionTerm>Total rewards</DescriptionTerm>
            <DescriptionDetail>{toLocalString(132231.312)} <small>{frdSmb}</small></DescriptionDetail>
          </DescriptionGroup>
          <DescriptionGroup horizontal>
            <DescriptionTerm>Liquid rewards</DescriptionTerm>
            <DescriptionDetail>
              {toLocalString(1231.312)} <small>{frdSmb}</small> (0.1% of your total balance {toLocalString(1231.312)} <small>{frdSmb}</small>)
            </DescriptionDetail>
          </DescriptionGroup>
        </DescriptionList>

      </div>
    </div>
  </div>
}