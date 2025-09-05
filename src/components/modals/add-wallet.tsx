"use client";

import { useRouter } from 'next/navigation';
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { WALLET_COOKIE_NAME } from "@/constants";
import { isValidAddress as validateObyteAddress } from "@/lib/isValidAddress";
import { useReactiveSetCookie } from "cookies-next";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

interface AddWalletModalProps {
  triggerClassName?: string;
  walletAddress?: string;
}

export const AddWalletModal: FC<AddWalletModalProps> = ({ triggerClassName = "", walletAddress }) => {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState(walletAddress || "");
  const [isValid, setIsValid] = useState<boolean>(false);

  const router = useRouter();
  const setCookie = useReactiveSetCookie();

  useEffect(() => {
    let cancelled = false;
    const v = inputValue.trim();
    if (!v) {
      setIsValid(false);
      return;
    }
    (async () => {
      const ok = await validateObyteAddress(v);
      if (!cancelled) setIsValid(ok);
    })();
    return () => {
      cancelled = true;
    };
  }, [inputValue]);

  const isChanged = walletAddress !== inputValue;

  const restoreInputValue = () => {
    setTimeout(() => {
      setInputValue(walletAddress || "");
    }, 500);
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitButtonRef?.current?.click();

      if (isValid) closeButtonRef?.current?.click();
    }
  }, [isValid]);

  const saveWallet = (value: string) => {
    setCookie(WALLET_COOKIE_NAME, value);
    closeButtonRef.current?.click();
    router.refresh();
  }

  return (<Dialog onOpenChange={(open) => {
    if (!open) restoreInputValue();
  }}>
    <DialogTrigger asChild>
      <Button ref={closeButtonRef} variant="default" className={triggerClassName}>
        {walletAddress ? `${walletAddress.slice(0, 3)}...${walletAddress.slice(-3)}` : "Add wallet"}
      </Button>
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
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value || "")}
        onKeyDown={handleKeyDown}
      />

      <DialogFooter>
        <Button onClick={() => saveWallet(inputValue)} disabled={!isChanged || !isValid} ref={submitButtonRef}>Save changes</Button>
      </DialogFooter>
    </DialogContent>

  </Dialog>)
}
