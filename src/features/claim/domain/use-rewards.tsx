"use client";

import { getCookie } from "cookies-next/client";
import { useEffect, useState } from "react";

import { useData } from "@/app/context";

import { getRewards } from "@/lib/calculations/get-rewards";
import { isSameDayUTC } from "@/lib/is-same-day-UTC";
import { isValidAddress } from "@/lib/is-valid-address";

import { WALLET_COOKIE_NAME } from "@/constants";

export const useRewards = () => {
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<IRewards | null>(null);
  const walletAddress = getCookie(WALLET_COOKIE_NAME);
  const [friendWallet, setFriendWallet] = useState<string | null>(null);
  const isValidFriendWallet = isValidAddress(friendWallet);

  const { state, getUserData } = useData();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!friendWallet) {
        setError(null);
        setRewards(null);
        return;
      }

      if (!isValidFriendWallet) {
        setError("Invalid address");
        setRewards(null);
        return;
      }

      const userData1 = walletAddress ? getUserData(walletAddress) : null;
      const userData2 = getUserData(friendWallet);

      if (!userData2) {
        setError("Both you and your friend must have deposited before claiming rewards");
        setRewards(null);
        return;
      }

      if (userData2.last_date && isSameDayUTC(new Date(userData2.last_date), new Date())) {
        setError("Your friend has already claimed today.");
        setRewards(null);
        return;
      }

      const rewards = await getRewards(userData1, userData2, state.constants);
      if (!cancelled) {
        setRewards(walletAddress ? rewards : null);
        setError(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state, walletAddress, friendWallet, isValidFriendWallet, getUserData]);

  return { error, rewards, friendWallet, isValidFriendWallet, changeFriendWallet: setFriendWallet };
}