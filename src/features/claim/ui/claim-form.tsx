"use client";

import { useGetCookie } from "cookies-next/client";
import { FC, useCallback, useRef } from "react";

import { DescriptionDetail, DescriptionGroup, DescriptionList, DescriptionTerm } from "@/components/ui/description-list";
import { Input } from "@/components/ui/input";
import { QRButton } from "@/components/ui/qr-button";

import { BOUNCE_FEES, WALLET_COOKIE_NAME } from "@/constants";

import { useData } from "@/app/context";
import { AddWalletModal } from "@/components/modals/add-wallet";


import { generateLink } from "@/lib/generate-link";
import { toLocalString } from "@/lib/to-local-string";

import { appConfig } from "@/app-config";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { isValidAddress } from "@/lib/is-valid-address";
import { useQueryState } from "nuqs";
import { useRewards } from "../domain/use-rewards";

interface ClaimFormProps { }

export const ClaimForm: FC<ClaimFormProps> = () => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const getCookie = useGetCookie();
  const walletAddress = getCookie(WALLET_COOKIE_NAME);

  const [friendAddress, setFriendAddress] = useQueryState("friend_address", {
    parse: (v) => isValidAddress(v) ? v : '',
    defaultValue: '',
    clearOnDefault: true
  });


  const { rewards, error, changeFriendWallet, isValidFriendWallet, friendWallet } = useRewards({
    defaultFriend: friendAddress || null
  });

  const data = useData();

  const { symbol: frdSymbol, decimals: frdDecimals } = data.getFrdToken();

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

  return <div id="befriend" className="grid gap-4">
    <h2 className="text-3xl font-bold">Claim rewards for becoming friends</h2>

    <div className="grid gap-4 text-muted-foreground text-md">
      <div>You and your new friend must claim rewards here within 10 minutes of each other. If any of you is late, you have to claim again.</div>
    </div>

    <FieldSet>
      <FieldGroup className="flex flex-col gap-4">
        <div className="flex items-end max-w-2xl gap-4">
          <Field className="w-full">
            <FieldLabel htmlFor="address">Your friend’s address</FieldLabel>
            <Input
              id="address"
              value={friendWallet ?? ""}
              onChange={(e) => {
                changeFriendWallet(e.target.value)
                setFriendAddress('');
              }}
              onKeyDown={handleKeyDown}
            />
          </Field>

          <QRButton
            href={url}
            disabled={!isValidFriendWallet || !!error || !friendWallet}
            ref={btnRef}
          >
            Claim
          </QRButton>
        </div>

        {error && friendWallet ? <div className="text-red-700">{error}</div> : null}

        <div>
          {rewards ? <div className="mb-2">
            You will receive:
          </div> : null}

          {rewards ? <DescriptionList>
            <DescriptionGroup>
              <DescriptionTerm>Locked rewards</DescriptionTerm>
              <DescriptionDetail>
                <div>
                  {toLocalString((rewards.user1.totalBalance * appConfig.initialRewardsVariables.locked_reward_share) / 10 ** frdDecimals)} <small>{frdSymbol}</small> ({toLocalString(appConfig.initialRewardsVariables.locked_reward_share * 100)}% of your total effective balance {toLocalString(rewards.user1.totalBalance / 10 ** frdDecimals)} <small>{frdSymbol}</small>)</div>
                <div>
                  {toLocalString((rewards?.user1?.new_user_reward ?? 0) / 10 ** frdDecimals)} <small>{frdSymbol}</small> (new user reward)
                </div>
              </DescriptionDetail>
            </DescriptionGroup>

            <DescriptionGroup horizontal>
              <DescriptionTerm>Liquid rewards</DescriptionTerm>
              <DescriptionDetail>
                {toLocalString(rewards.user1.liquid / 10 ** frdDecimals)} <small>{frdSymbol}</small> ({toLocalString(appConfig.initialRewardsVariables.liquid_reward_share * 100)}% of your total effective balance {toLocalString(rewards.user1.totalBalance / 10 ** frdDecimals)} <small>{frdSymbol}</small>)
              </DescriptionDetail>
            </DescriptionGroup>
          </DescriptionList> : (!walletAddress ? <div className="text-yellow-600">
            <AddWalletModal>
              <span className="cursor-pointer link-style">Add your address</span>
            </AddWalletModal> to see the rewards for this friendship
          </div> : null)}
        </div>
      </FieldGroup>
    </FieldSet>
  </div>
}