"use server";

import { REF_COOKIE_EXPIRES, REF_COOKIE_NAME, WALLET_COOKIE_NAME } from "@/constants";
import { isValidAddress } from "@/lib/is-valid-address";
import { cookies, headers } from "next/headers";
import "server-only";

export const applyRef = async (ref: string) => {
  if (!isValidAddress(ref)) return;

  const state = globalThis.__GLOBAL_STORE__?.getState() ?? {};
  const refUserData = state?.[`user_${ref}`] as IUserData | undefined;
  if (!refUserData) return; // referral address is not existing user

  const userHeaders = await headers();

  const url = userHeaders.get('referer') ?? "";
  const searchParams = new URL(url).searchParams;
  const isReferral =
    searchParams.has("r") || searchParams.has("type");

  if (!isReferral) return;

  const userCookies = await cookies();
  const referralAddressCookie = userCookies.get(REF_COOKIE_NAME)?.value
  const walletAddressCookie = userCookies.get(WALLET_COOKIE_NAME)?.value

  const hasReferralCookie = Boolean(referralAddressCookie);
  const isSelfReferral = ref === walletAddressCookie;

  // If user already has referral cookie or attempts to refer themselves
  if (hasReferralCookie || isSelfReferral) {
    if (walletAddressCookie && referralAddressCookie && walletAddressCookie === referralAddressCookie) {
      userCookies.delete(REF_COOKIE_NAME);
    }

    return;
  }

  // Apply referral
  userCookies.set(REF_COOKIE_NAME, ref, {
    expires: REF_COOKIE_EXPIRES,
    path: '/',
  });
}