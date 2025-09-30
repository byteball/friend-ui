"use client";

import { useReactiveSetCookie } from "cookies-next";
import { useRouter } from 'next/navigation';
import { FC, useCallback, useRef } from "react";

import { WALLET_COOKIE_NAME } from "@/constants";
import { useWalletState } from '@/hooks/use-wallet-state';
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

interface AddWalletModalProps {
  triggerClassName?: string;
  walletAddress?: string;
  children?: React.ReactNode;
}

export const AddWalletModal: FC<AddWalletModalProps> = ({ triggerClassName = "", walletAddress, children }) => {
  const { wallet, isValid, isChecking, changeWallet } = useWalletState(walletAddress ?? null);

  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const setCookie = useReactiveSetCookie();

  const isChanged = walletAddress !== wallet;

  const restoreInputValue = () => {
    setTimeout(() => {
      changeWallet(walletAddress || null);
    }, 500);
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      saveWallet();
    }
  }, [isValid]);

  const saveWallet = () => {
    if (!wallet || !isValid || isChecking || !isChanged) return;

    setCookie(WALLET_COOKIE_NAME, wallet);

    closeButtonRef.current?.click();
    router.refresh();
  }

  const handleWalletChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    changeWallet(e.target.value.length ? e.target.value : null);
  }, [changeWallet]);

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
          <a href="https://obyte.org/#download" className="text-blue-700">Install Obyte wallet</a> if you don&apos;t have one yet, and copy/paste your address here.
        </DialogDescription>
      </DialogHeader>

      <Input
        name="wallet"
        value={wallet ?? ''}
        onChange={handleWalletChange}
        onKeyDown={handleKeyDown}
      />

      <DialogFooter>
        <Button
          onClick={saveWallet}
          disabled={!wallet || !isValid || isChecking || !isChanged}
          ref={submitButtonRef}
        >
          Save changes
        </Button>
      </DialogFooter>
    </DialogContent>

  </Dialog>)
}
