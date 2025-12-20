"use client";

import { useReactiveSetCookie } from "cookies-next";
import { useRouter } from 'next/navigation';
import { FC, useRef, useState } from "react";

import { isValidAddress } from "@/lib/is-valid-address";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

import { WALLET_COOKIE_NAME } from "@/constants";

interface AddWalletModalProps {
  triggerClassName?: string;
  walletAddress?: string;
  children?: React.ReactNode;
}

export const AddWalletModal: FC<AddWalletModalProps> = ({ triggerClassName = "", walletAddress, children }) => {
  const [wallet, changeWallet] = useState<string | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const setCookie = useReactiveSetCookie();

  const isValid = wallet && isValidAddress(wallet);
  const isChanged = walletAddress !== wallet;

  const restoreInputValue = () => {
    setTimeout(() => {
      changeWallet(walletAddress || null);
    }, 500);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveWallet();
    }
  }

  const saveWallet = () => {
    if (!wallet || !isValid || !isChanged) return;

    setCookie(WALLET_COOKIE_NAME, wallet);

    closeButtonRef.current?.click();
    router.refresh();
  }

  const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeWallet(e.target.value.length ? e.target.value : null);
  }

  return (<Dialog onOpenChange={(open) => {
    if (!open) restoreInputValue();
  }}>
    <DialogTrigger asChild>
      {!children ? <Button ref={closeButtonRef} variant="default" className={triggerClassName}>
        {walletAddress ? `${walletAddress.slice(0, 3)}...${walletAddress.slice(-3)}` : "Add wallet"}
      </Button> : children}
    </DialogTrigger>

    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add wallet</DialogTitle>
        <DialogDescription>
          <a href="https://obyte.org/#download" target="_blank" rel="noopener" className="underline underline-offset-3 text-white">Install Obyte wallet</a> if you don&apos;t have one yet, and copy/paste your address here.
        </DialogDescription>
      </DialogHeader>

      <Input
        name="wallet"
        value={wallet ?? walletAddress ?? ''}
        onChange={handleWalletChange}
        onKeyDown={handleKeyDown}
      />

      <DialogFooter>
        <Button
          onClick={saveWallet}
          disabled={!wallet || !isValid || !isChanged}
          ref={submitButtonRef}
        >
          Save changes
        </Button>
      </DialogFooter>
    </DialogContent>

  </Dialog>)
}
