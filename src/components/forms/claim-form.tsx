"use client";

import { getCookie } from "cookies-next/client";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { DescriptionDetail, DescriptionGroup, DescriptionList, DescriptionTerm } from "../ui/description-list";
import { Input } from "../ui/input";
import { QRButton } from "../ui/qr-button";

import { BOUNCE_FEES, WALLET_COOKIE_NAME } from "@/constants";

import { useData } from "@/app/context";
import { AddWalletModal } from "@/components/modals/add-wallet";

import { useWalletState } from "@/hooks/use-wallet-state";

import { getRewards } from "@/lib/calculations/getRewards";
import { generateLink } from "@/lib/generateLink";
import { isSameDayUTC } from "@/lib/isSameDayUTC";
import { toLocalString } from "@/lib/toLocalString";

import { appConfig } from "@/appConfig";

interface ClaimFormProps { }

export const ClaimForm: FC<ClaimFormProps> = () => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const walletAddress = getCookie(WALLET_COOKIE_NAME);
  const { wallet: friendWallet, isValid: isValidFriendWallet, isChecking, changeWallet } = useWalletState(walletAddress ?? null);

  const data = useData();
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<IRewards | null>(null);

  const state = data?.state ?? {};
  const frdAsset = state?.constants?.asset;
  const frdTokenMeta = data?.tokens?.[frdAsset || ''];
  const frdSmb = frdTokenMeta?.symbol || 'FRD';

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" && isValidFriendWallet) {
      btnRef.current?.click();
    }
  }, [btnRef, isValidFriendWallet]);

  const url = generateLink({
    aa: appConfig.AA_ADDRESS,
    amount: BOUNCE_FEES,
    from_address: walletAddress,
    data: {
      connect: 1,
      friend: friendWallet || undefined
    }
  })

  useEffect(() => {
    (async () => {
      console.log('Calculating rewards...', isValidFriendWallet);

      if (isValidFriendWallet) {
        const userData1: IUserData = walletAddress ? state[`user_${walletAddress}`] : undefined;
        const userData2: IUserData = isValidFriendWallet ? state[`user_${friendWallet}`] : undefined;

        if (!userData2) {
          setError("Both you and your friend must have deposited before claiming rewards");
          setRewards(null);
          return;
        }

        if (userData2.last_date) {
          if (isSameDayUTC(new Date(userData2.last_date), new Date())) {
            setError("Your friend has already claimed today.");
            setRewards(null);
            return;
          }
        }

        const rewards = await getRewards(userData1, userData2, state.constants);
        setRewards(walletAddress ? rewards : null);
        setError(null);
      } else {
        setError("Invalid address");
        setRewards(null);
      }

    })();
  }, [data?.state, walletAddress, friendWallet, isValidFriendWallet]);

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
              value={friendWallet ?? ""}
              onChange={(e) => changeWallet(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <QRButton
            href={url}
            disabled={!isValidFriendWallet || !!error || isChecking || !friendWallet}
            ref={btnRef}
          >Claim</QRButton>
        </div>

        {error && friendWallet ? <div className="text-red-700">{error}</div> : null}

        {rewards ? <DescriptionList>
          <DescriptionGroup>
            <DescriptionTerm>Locked rewards</DescriptionTerm>
            <DescriptionDetail>
              <div>
                {toLocalString((rewards.user1.totalBalance * 0.01) / 10 ** 9)} <small>{frdSmb}</small> (1% of your total balance {toLocalString(rewards.user1.totalBalance / 10 ** 9)} <small>{frdSmb}</small>)</div>
              <div>
                {toLocalString((rewards?.user1?.new_user_reward ?? 0) / 10 ** 9)} <small>{frdSmb}</small> (new user reward)
              </div>
            </DescriptionDetail>
          </DescriptionGroup>
          <DescriptionGroup horizontal>
            <DescriptionTerm>Total rewards</DescriptionTerm>
            <DescriptionDetail>{toLocalString(rewards.user1.locked / 10 ** 9)} <small>{frdSmb}</small></DescriptionDetail>
          </DescriptionGroup>
          <DescriptionGroup horizontal>
            <DescriptionTerm>Liquid rewards</DescriptionTerm>
            <DescriptionDetail>
              {toLocalString(rewards.user1.liquid / 10 ** 9)} <small>{frdSmb}</small> (0.1% of your total balance {toLocalString(rewards.user1.totalBalance / 10 ** 9)} <small>{frdSmb}</small>)
            </DescriptionDetail>
          </DescriptionGroup>
        </DescriptionList> : (!walletAddress ? <div className="text-yellow-600">
          <AddWalletModal>
            <span className="cursor-pointer underline">Add your address</span>
          </AddWalletModal> to see the rewards for this friendship
        </div> : null)}
      </div>
    </div>
  </div>
}