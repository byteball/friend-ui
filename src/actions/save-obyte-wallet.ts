"use server";

import { cookies } from 'next/headers';

import { WALLET_COOKIE_EXPIRES, WALLET_COOKIE_NAME } from './constants';

export async function saveWalletAction(formData: FormData) {
  // runs on the server
  const wallet = formData.get("wallet");
  console.log('Setting wallet:', wallet);

  const cookieStore = await cookies();

  if (!wallet || typeof wallet !== 'string') {
    throw new Error("Wallet is required");
  }

  console.log('Setting wallet cookie:', wallet);

  cookieStore.set({
    name: WALLET_COOKIE_NAME,
    value: wallet,
    // httpOnly: true,
    secure: true,
    path: '/',
    maxAge: WALLET_COOKIE_EXPIRES,
  });
}